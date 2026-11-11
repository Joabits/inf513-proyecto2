<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use App\Modulos\Documentos\Documento;
use Database\Seeders\PermisoSeeder;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DocumentosTest extends TestCase
{
    use RefreshDatabase;

    private const XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([RolSeeder::class, PermisoSeeder::class]);
        Storage::fake('local');
    }

    private function editor(string $rol = Rol::EDITOR_INSTITUCIONAL): User
    {
        return User::factory()->create(['rol_id' => Rol::where('slug', $rol)->value('id')]);
    }

    private function pdf(string $nombre = 'reglamento.pdf', int $kb = 100): UploadedFile
    {
        return UploadedFile::fake()->create($nombre, $kb, 'application/pdf');
    }

    private function datos(array $cambios = []): array
    {
        return [
            'titulo' => 'Reglamento de titulación',
            'descripcion' => 'Modalidades y requisitos.',
            'categoria' => 'Reglamentos',
            'publicado' => '1',
            'archivo' => $this->pdf(),
            ...$cambios,
        ];
    }

    private function crear(array $cambios = []): Documento
    {
        $id = $this->actingAs($this->editor())->post('/api/gestion/documentos', $this->datos($cambios), ['Accept' => 'application/json'])
            ->assertCreated()
            ->json('data.id');

        return Documento::findOrFail($id);
    }

    public function test_gestionar_documentos_exige_sesion_y_permiso(): void
    {
        $this->getJson('/api/gestion/documentos')->assertUnauthorized();

        $this->actingAs($this->editor(Rol::EDITOR_COMUNICACION))
            ->postJson('/api/gestion/documentos', $this->datos())
            ->assertForbidden();
    }

    public function test_el_editor_sube_un_pdf_y_queda_en_la_bitacora(): void
    {
        $documento = $this->crear();

        $this->assertSame('pdf', $documento->tipo);
        $this->assertSame('reglamento.pdf', $documento->nombre_original);
        $this->assertNotSame('reglamento.pdf', basename($documento->archivo));
        Storage::disk('local')->assertExists($documento->archivo);
        $this->assertSame(1, DB::table('bitacora')->where('accion', 'crear')->where('recurso', 'Documento #'.$documento->id)->count());
    }

    public function test_acepta_excel(): void
    {
        $documento = $this->crear(['archivo' => UploadedFile::fake()->create('horarios.xlsx', 50, self::XLSX)]);

        $this->assertSame('xlsx', $documento->tipo);
    }

    public function test_rechaza_otros_tipos_aunque_cambien_la_extension(): void
    {
        $editor = $this->editor();

        foreach ([
            UploadedFile::fake()->create('foto.pdf', 10, 'image/png'),
            UploadedFile::fake()->create('carta.docx', 10, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
            UploadedFile::fake()->create('programa.exe', 10, 'application/x-msdownload'),
        ] as $archivo) {
            $this->actingAs($editor)->post('/api/gestion/documentos', $this->datos(['archivo' => $archivo]), ['Accept' => 'application/json'])
                ->assertUnprocessable()
                ->assertJsonValidationErrors(['archivo' => 'PDF o Excel']);
        }

        $this->assertSame(0, Documento::count());
    }

    public function test_rechaza_archivos_de_mas_de_10_mb(): void
    {
        $this->actingAs($this->editor())
            ->post('/api/gestion/documentos', $this->datos(['archivo' => $this->pdf(kb: 10241)]), ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['archivo' => '10 MB']);
    }

    public function test_editar_sin_archivo_no_crea_version(): void
    {
        $documento = $this->crear();

        $this->putJson("/api/gestion/documentos/{$documento->id}", [...$this->datos(['titulo' => 'Reglamento actualizado']), 'archivo' => null])
            ->assertOk()
            ->assertJsonPath('data.titulo', 'Reglamento actualizado')
            ->assertJsonPath('data.versiones', 0);
    }

    public function test_reemplazar_el_archivo_guarda_el_anterior_en_el_historial(): void
    {
        $documento = $this->crear();
        $anterior = $documento->archivo;

        $this->post("/api/gestion/documentos/{$documento->id}", [
            ...$this->datos(['archivo' => $this->pdf('reglamento-2026.pdf')]),
            '_method' => 'PUT',
        ], ['Accept' => 'application/json'])->assertOk()->assertJsonPath('data.versiones', 1);

        $documento->refresh();
        $this->assertNotSame($anterior, $documento->archivo);
        Storage::disk('local')->assertExists([$anterior, $documento->archivo]);

        $this->getJson("/api/gestion/documentos/{$documento->id}/versiones")
            ->assertOk()
            ->assertJsonPath('data.0.nombre_original', 'reglamento.pdf');
    }

    public function test_el_visitante_descarga_solo_documentos_publicados(): void
    {
        $publicado = $this->crear();
        $oculto = $this->crear(['titulo' => 'Borrador', 'publicado' => '0']);

        $this->get("/api/documentos/{$publicado->id}/descargar")
            ->assertOk()
            ->assertHeader('content-disposition', 'inline; filename=reglamento-de-titulacion.pdf');

        $this->get("/api/documentos/{$oculto->id}/descargar")->assertNotFound();
    }

    public function test_no_se_descarga_la_version_de_otro_documento(): void
    {
        $documento = $this->crear();
        $otro = $this->crear(['titulo' => 'Otro']);
        $version = $documento->versiones()->create($documento->only(['archivo', 'nombre_original', 'tipo', 'tamano']));

        $this->get("/api/gestion/documentos/{$otro->id}/versiones/{$version->id}/descargar")->assertNotFound();
        $this->get("/api/gestion/documentos/{$documento->id}/versiones/{$version->id}/descargar")->assertOk();
    }

    public function test_eliminar_borra_el_documento_su_historial_y_sus_archivos(): void
    {
        $documento = $this->crear();
        $this->post("/api/gestion/documentos/{$documento->id}", [...$this->datos(), '_method' => 'PUT'], ['Accept' => 'application/json'])->assertOk();
        $archivos = [$documento->archivo, $documento->refresh()->archivo];

        $this->deleteJson("/api/gestion/documentos/{$documento->id}")->assertNoContent();

        $this->assertSame(0, Documento::count());
        $this->assertSame(0, DB::table('documento_versiones')->count());
        Storage::disk('local')->assertMissing($archivos);
        $this->assertSame(1, DB::table('bitacora')->where('accion', 'eliminar')->count());
    }
}
