<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use App\Modulos\Revista\Articulo;
use App\Modulos\Revista\Edicion;
use App\Modulos\Revista\Revista;
use Database\Seeders\PermisoSeeder;
use Database\Seeders\RevistaSeeder;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class RevistaTest extends TestCase
{
    use RefreshDatabase;

    private const JSON = ['Accept' => 'application/json'];

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([RolSeeder::class, PermisoSeeder::class, RevistaSeeder::class]);
        Storage::fake('local');
        Storage::fake('public');
    }

    private function editor(string $rol = Rol::EDITOR_INSTITUCIONAL): User
    {
        return User::factory()->create(['rol_id' => Rol::where('slug', $rol)->value('id')]);
    }

    private function pdf(string $nombre = 'edicion.pdf', int $kb = 100): UploadedFile
    {
        return UploadedFile::fake()->create($nombre, $kb, 'application/pdf');
    }

    private function datosEdicion(array $cambios = []): array
    {
        return ['volumen' => '1', 'numero' => '1', 'anio' => (string) now()->year, 'titulo' => 'Innovación y gestión', 'descripcion' => 'Primer número.', 'publicada' => '0', ...$cambios];
    }

    private function edicion(array $cambios = []): Edicion
    {
        return Edicion::create(['volumen' => 1, 'numero' => 1, 'anio' => 2026, 'publicada' => true, ...$cambios]);
    }

    private function articulo(Edicion $edicion, string $titulo = 'Artículo de prueba', int $orden = 0, ?string $archivo = null): Articulo
    {
        return $edicion->articulos()->create(['titulo' => $titulo, 'autores' => 'Autor Uno', 'orden' => $orden, 'archivo' => $archivo, 'archivo_nombre' => $archivo ? 'a.pdf' : null]);
    }

    public function test_el_visitante_ve_solo_las_ediciones_publicadas_con_sus_articulos(): void
    {
        $publicada = $this->edicion(['numero' => 2, 'titulo' => 'Visible']);
        $this->articulo($publicada, 'Artículo visible');
        $borrador = $this->edicion(['numero' => 3, 'titulo' => 'Borrador', 'publicada' => false]);
        $this->articulo($borrador, 'Artículo del borrador');

        $respuesta = $this->getJson('/api/revista')->assertOk();

        $respuesta->assertJsonCount(1, 'ediciones')
            ->assertJsonPath('ediciones.0.titulo', 'Visible')
            ->assertJsonPath('ediciones.0.articulos.0.titulo', 'Artículo visible')
            ->assertJsonPath('ediciones.0.nombre', 'Volumen 1 · Número 2 · 2026');
        $this->assertStringContainsString('Revista Académica Institucional', $respuesta->json('revista.presentacion'));
        $this->assertStringNotContainsString('Borrador', $respuesta->getContent());
    }

    public function test_las_ediciones_van_de_la_mas_reciente_a_la_mas_antigua(): void
    {
        $this->edicion(['numero' => 1, 'anio' => 2025, 'titulo' => 'A']);
        $this->edicion(['numero' => 1, 'anio' => 2026, 'titulo' => 'B']);
        $this->edicion(['numero' => 2, 'anio' => 2026, 'titulo' => 'C']);

        $this->assertSame(['C', 'B', 'A'], array_column($this->getJson('/api/revista')->json('ediciones'), 'titulo'));
    }

    public function test_gestionar_exige_sesion_y_permiso(): void
    {
        $this->getJson('/api/gestion/revista')->assertUnauthorized();

        $this->actingAs($this->editor(Rol::EDITOR_COMUNICACION))
            ->postJson('/api/gestion/revista/ediciones', $this->datosEdicion())
            ->assertForbidden();
    }

    public function test_el_panel_incluye_los_borradores(): void
    {
        $this->edicion(['titulo' => 'Borrador', 'publicada' => false]);

        $this->actingAs($this->editor())->getJson('/api/gestion/revista')->assertOk()->assertJsonPath('ediciones.0.titulo', 'Borrador');
    }

    public function test_crear_una_edicion_la_deja_en_borrador_y_en_la_bitacora(): void
    {
        $editor = $this->editor();

        $respuesta = $this->actingAs($editor)->post('/api/gestion/revista/ediciones', $this->datosEdicion([
            'archivo' => $this->pdf('numero1.pdf'),
            'portada' => UploadedFile::fake()->image('portada.jpg', 400, 500),
        ]), self::JSON)->assertOk();

        $respuesta->assertJsonPath('ediciones.0.publicada', false)
            ->assertJsonPath('ediciones.0.archivo.nombre', 'numero1.pdf')
            ->assertJsonPath('ediciones.0.portada', fn ($url) => str_contains($url, '/storage/revista/portadas/'));
        $edicion = Edicion::first();
        $this->assertSame($editor->id, $edicion->user_id);
        $this->assertNotSame('numero1.pdf', basename($edicion->archivo));
        Storage::disk('local')->assertExists($edicion->archivo);
        Storage::disk('public')->assertExists($edicion->portada);
        $this->assertSame(1, DB::table('bitacora')->where('accion', 'crear')->where('recurso', 'Edicion #'.$edicion->id)->count());
    }

    public function test_una_edicion_no_se_repite_con_el_mismo_volumen_numero_y_anio(): void
    {
        $this->edicion(['volumen' => 1, 'numero' => 1, 'anio' => 2026]);
        $editor = $this->editor();

        $this->actingAs($editor)->post('/api/gestion/revista/ediciones', $this->datosEdicion(['anio' => '2026']), self::JSON)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['numero' => 'Ya existe']);

        // Otro volumen u otro año sí es otra edición
        $this->post('/api/gestion/revista/ediciones', $this->datosEdicion(['volumen' => '2', 'anio' => '2026']), self::JSON)->assertOk();
        $this->post('/api/gestion/revista/ediciones', $this->datosEdicion(['volumen' => '', 'anio' => '2026']), self::JSON)->assertOk();
        // Sin volumen también se detecta el duplicado
        $this->post('/api/gestion/revista/ediciones', $this->datosEdicion(['volumen' => '', 'anio' => '2026']), self::JSON)->assertUnprocessable();
    }

    public function test_editar_una_edicion_no_choca_consigo_misma(): void
    {
        $edicion = $this->edicion(['publicada' => false]);

        $this->actingAs($this->editor())
            ->post("/api/gestion/revista/ediciones/{$edicion->id}", [...$this->datosEdicion(['anio' => '2026', 'titulo' => 'Nuevo título']), '_method' => 'PUT'], self::JSON)
            ->assertOk()
            ->assertJsonPath('ediciones.0.titulo', 'Nuevo título');
    }

    public function test_valida_los_archivos(): void
    {
        $editor = $this->editor();

        foreach ([
            ['archivo' => UploadedFile::fake()->create('texto.docx', 10, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')],
            ['archivo' => UploadedFile::fake()->create('foto.pdf', 10, 'image/png')],
            ['archivo' => $this->pdf(kb: 25601)],
            ['portada' => UploadedFile::fake()->image('chica.jpg', 120, 120)],
            ['portada' => UploadedFile::fake()->create('portada.pdf', 10, 'application/pdf')],
        ] as $caso) {
            $this->actingAs($editor)->post('/api/gestion/revista/ediciones', $this->datosEdicion($caso), self::JSON)->assertUnprocessable();
        }

        $this->assertSame(0, Edicion::count());
    }

    public function test_reemplazar_y_quitar_los_archivos_borra_los_anteriores(): void
    {
        $this->actingAs($this->editor());
        $this->post('/api/gestion/revista/ediciones', $this->datosEdicion(['archivo' => $this->pdf('uno.pdf'), 'portada' => UploadedFile::fake()->image('a.jpg', 400, 500)]), self::JSON)->assertOk();
        $edicion = Edicion::first();
        [$pdfViejo, $portadaVieja] = [$edicion->archivo, $edicion->portada];
        $ruta = "/api/gestion/revista/ediciones/{$edicion->id}";
        $base = [...$this->datosEdicion(), '_method' => 'PUT'];

        $this->post($ruta, [...$base, 'archivo' => $this->pdf('dos.pdf'), 'portada' => UploadedFile::fake()->image('b.jpg', 400, 500)], self::JSON)->assertOk();
        Storage::disk('local')->assertMissing($pdfViejo);
        Storage::disk('public')->assertMissing($portadaVieja);
        $edicion->refresh();
        $this->assertSame('dos.pdf', $edicion->archivo_nombre);
        [$pdfNuevo, $portadaNueva] = [$edicion->archivo, $edicion->portada];

        // Sin enviar archivos, los actuales se conservan
        $this->post($ruta, $base, self::JSON)->assertOk();
        Storage::disk('local')->assertExists($pdfNuevo);

        $this->post($ruta, [...$base, 'quitar_archivo' => '1', 'quitar_portada' => '1'], self::JSON)
            ->assertOk()
            ->assertJsonPath('ediciones.0.archivo', null)
            ->assertJsonPath('ediciones.0.portada', null);
        Storage::disk('local')->assertMissing($pdfNuevo);
        Storage::disk('public')->assertMissing($portadaNueva);
        $this->assertNull($edicion->refresh()->archivo_nombre);
    }

    public function test_publicar_y_ocultar_queda_en_la_bitacora_sin_tocar_la_fecha(): void
    {
        $edicion = $this->edicion(['publicada' => false]);
        $actualizada = $edicion->updated_at;
        $this->travel(1)->hours();
        $this->actingAs($this->editor());

        $this->patchJson("/api/gestion/revista/ediciones/{$edicion->id}/publicacion", ['publicada' => true])->assertOk()->assertJsonPath('ediciones.0.publicada', true);
        $this->assertCount(1, $this->getJson('/api/revista')->json('ediciones'));

        $this->patchJson("/api/gestion/revista/ediciones/{$edicion->id}/publicacion", ['publicada' => false])->assertOk();
        $this->assertCount(0, $this->getJson('/api/revista')->json('ediciones'));

        // Repetir el estado no registra nada
        $this->patchJson("/api/gestion/revista/ediciones/{$edicion->id}/publicacion", ['publicada' => false])->assertOk();

        $this->assertSame(['publicar', 'ocultar'], DB::table('bitacora')->whereIn('accion', ['publicar', 'ocultar'])->orderBy('id')->pluck('accion')->all());
        $this->assertTrue($actualizada->equalTo($edicion->refresh()->updated_at));
    }

    public function test_el_visitante_descarga_solo_lo_publicado(): void
    {
        Storage::disk('local')->put('revista/ediciones/n1.pdf', '%PDF-1.4 contenido');
        $publicada = $this->edicion(['archivo' => 'revista/ediciones/n1.pdf', 'archivo_nombre' => 'n1.pdf']);
        $articulo = $this->articulo($publicada, 'Clima organizacional', archivo: 'revista/ediciones/n1.pdf');
        $borrador = $this->edicion(['numero' => 9, 'publicada' => false, 'archivo' => 'revista/ediciones/n1.pdf', 'archivo_nombre' => 'n1.pdf']);
        $articuloBorrador = $this->articulo($borrador, 'Oculto', archivo: 'revista/ediciones/n1.pdf');
        $sinArchivo = $this->edicion(['numero' => 8]);

        $this->get("/api/revista/ediciones/{$publicada->id}/archivo")->assertOk()->assertHeader('content-disposition', 'inline; filename=innovar-volumen-1-numero-1-2026.pdf');
        $this->get("/api/revista/articulos/{$articulo->id}/archivo")->assertOk()->assertHeader('content-disposition', 'inline; filename=clima-organizacional.pdf');

        $this->get("/api/revista/ediciones/{$borrador->id}/archivo")->assertNotFound();
        $this->get("/api/revista/articulos/{$articuloBorrador->id}/archivo")->assertNotFound();
        $this->get("/api/revista/ediciones/{$sinArchivo->id}/archivo")->assertNotFound();
    }

    public function test_desde_el_panel_se_descargan_tambien_los_borradores(): void
    {
        Storage::disk('local')->put('revista/ediciones/borrador.pdf', '%PDF-1.4 contenido');
        $borrador = $this->edicion(['publicada' => false, 'archivo' => 'revista/ediciones/borrador.pdf', 'archivo_nombre' => 'borrador.pdf']);

        $this->get("/api/gestion/revista/ediciones/{$borrador->id}/archivo", self::JSON)->assertUnauthorized();

        $this->actingAs($this->editor())->get("/api/gestion/revista/ediciones/{$borrador->id}/archivo")->assertOk();
    }

    public function test_los_articulos_se_crean_al_final_se_editan_y_se_eliminan(): void
    {
        $edicion = $this->edicion();
        $this->actingAs($this->editor());
        $datos = fn (array $c = []) => ['titulo' => 'Primer artículo', 'autores' => 'Ana Rojas; Luis Pardo', 'resumen' => 'Resumen del artículo.', ...$c];

        $this->post("/api/gestion/revista/ediciones/{$edicion->id}/articulos", $datos(['archivo' => $this->pdf('art1.pdf')]), self::JSON)->assertOk();
        $this->post("/api/gestion/revista/ediciones/{$edicion->id}/articulos", $datos(['titulo' => 'Segundo artículo']), self::JSON)
            ->assertOk()
            ->assertJsonPath('ediciones.0.articulos.1.titulo', 'Segundo artículo');
        [$primero, $segundo] = [Articulo::orderBy('orden')->first(), Articulo::orderByDesc('orden')->first()];
        $this->assertSame([0, 1], [$primero->orden, $segundo->orden]);
        Storage::disk('local')->assertExists($primero->archivo);

        $this->post("/api/gestion/revista/articulos/{$primero->id}", [...$datos(['titulo' => 'Título corregido']), 'quitar_archivo' => '1', '_method' => 'PUT'], self::JSON)
            ->assertOk()
            ->assertJsonPath('ediciones.0.articulos.0.titulo', 'Título corregido')
            ->assertJsonPath('ediciones.0.articulos.0.archivo', null);
        Storage::disk('local')->assertMissing($primero->archivo);

        $this->deleteJson("/api/gestion/revista/articulos/{$segundo->id}")->assertOk()->assertJsonCount(1, 'ediciones.0.articulos');
        $this->assertSame(4, DB::table('bitacora')->whereIn('accion', ['crear', 'editar', 'eliminar'])->where('recurso', 'like', 'Articulo%')->count());
    }

    public function test_ordenar_los_articulos_solo_acepta_los_de_esa_edicion(): void
    {
        $edicion = $this->edicion();
        $otra = $this->edicion(['numero' => 2]);
        [$a, $b] = [$this->articulo($edicion, 'A', 0), $this->articulo($edicion, 'B', 1)];
        $ajeno = $this->articulo($otra, 'Ajeno');
        $this->actingAs($this->editor());
        $ruta = "/api/gestion/revista/ediciones/{$edicion->id}/articulos/orden";

        $this->putJson($ruta, ['ids' => [$b->id, $ajeno->id]])->assertUnprocessable()->assertJsonValidationErrors('ids.1');

        $this->putJson($ruta, ['ids' => [$b->id, $a->id]])->assertOk();
        $this->assertSame(['B', 'A'], array_column($this->getJson('/api/revista')->json('ediciones.1.articulos'), 'titulo'));
    }

    public function test_eliminar_una_edicion_borra_sus_articulos_y_todos_sus_archivos(): void
    {
        $this->actingAs($this->editor());
        $this->post('/api/gestion/revista/ediciones', $this->datosEdicion(['archivo' => $this->pdf(), 'portada' => UploadedFile::fake()->image('a.jpg', 400, 500)]), self::JSON)->assertOk();
        $edicion = Edicion::first();
        $this->post("/api/gestion/revista/ediciones/{$edicion->id}/articulos", ['titulo' => 'Artículo', 'autores' => 'Autor', 'archivo' => $this->pdf('a.pdf')], self::JSON)->assertOk();
        $archivos = [$edicion->archivo, Articulo::first()->archivo];
        $portada = $edicion->portada;

        $this->deleteJson("/api/gestion/revista/ediciones/{$edicion->id}")->assertOk()->assertJsonCount(0, 'ediciones');

        $this->assertSame(0, Articulo::count());
        Storage::disk('local')->assertMissing($archivos);
        Storage::disk('public')->assertMissing($portada);
        $this->assertSame(1, DB::table('bitacora')->where('accion', 'eliminar')->where('recurso', 'Edicion #'.$edicion->id)->count());
    }

    public function test_el_editor_actualiza_la_presentacion_y_los_colaboradores(): void
    {
        $this->actingAs($this->editor());

        $this->putJson('/api/gestion/revista/contenido', ['presentacion' => 'Corta'])->assertUnprocessable()->assertJsonValidationErrors('presentacion');

        $this->putJson('/api/gestion/revista/contenido', ['presentacion' => 'Una presentación nueva de la revista INNOVAR.', 'colaboradores' => "  Envíe su artículo en PDF.\n\n\n\nAl correo de la revista.  "])
            ->assertOk()
            ->assertJsonPath('revista.colaboradores', "Envíe su artículo en PDF.\n\nAl correo de la revista.");

        $this->putJson('/api/gestion/revista/contenido', ['presentacion' => 'Una presentación nueva de la revista INNOVAR.', 'colaboradores' => ''])
            ->assertOk()
            ->assertJsonPath('revista.colaboradores', null);
    }

    public function test_el_seeder_no_inventa_ediciones_ni_borra_lo_editado(): void
    {
        $this->assertSame(0, Edicion::count());
        $this->assertNull(Revista::first()->colaboradores);

        Revista::first()->update(['presentacion' => 'Texto editado por el personal de la Carrera.']);
        $this->seed(RevistaSeeder::class);

        $this->assertSame(1, Revista::count());
        $this->assertSame('Texto editado por el personal de la Carrera.', Revista::first()->presentacion);
    }
}
