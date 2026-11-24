<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use App\Modulos\Graduados\Model as Graduado;
use Database\Seeders\PermisoSeeder;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GraduadosTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([RolSeeder::class, PermisoSeeder::class]);
    }

    private function editor(string $rol = Rol::EDITOR_INSTITUCIONAL): User
    {
        return User::factory()->create(['rol_id' => Rol::where('slug', $rol)->value('id')]);
    }

    public function test_sin_sesion_no_puede_ver_panel(): void
    {
        $this->getJson('/api/gestion/graduados')
            ->assertUnauthorized();
    }

    public function test_visitante_puede_consultar_graduados_publicos(): void
    {
        $editor = $this->editor();
        Graduado::create([
            'nombre_completo' => 'Mario Gomez',
            'ci' => '1234567',
            'correo' => 'mario@ejemplo.com',
            'telefono' => '70000000',
            'gestion_ingreso' => 'I-2018',
            'gestion_egreso' => 'II-2023',
            'modalidad' => 'Tesis de Grado',
            'titulo_tema' => 'Sistema de información',
            'user_id' => $editor->id,
        ]);

        $this->getJson('/api/graduados')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.nombre_completo', 'Mario Gomez')
            ->assertJsonPath('data.0.modalidad', 'Tesis de Grado');
    }

    private function graduado(array $datos = []): Graduado
    {
        return Graduado::create([
            'nombre_completo' => 'Mario Gomez', 'ci' => '1234567', 'correo' => 'mario@ejemplo.com',
            'gestion_ingreso' => 'I-2018', 'gestion_egreso' => 'II-2023', 'modalidad' => 'Tesis de Grado',
            'user_id' => $this->editor()->id, ...$datos,
        ]);
    }

    public function test_exportar_exige_el_permiso_exportar_y_queda_en_la_bitacora(): void
    {
        $this->graduado();

        $this->actingAs($this->editor(Rol::EDITOR_COMUNICACION))->get('/api/gestion/graduados/exportar')->assertForbidden();
        $this->actingAs($this->editor())->get('/api/gestion/graduados/exportar')->assertOk();

        $this->assertTrue(\DB::table('bitacora')->where('accion', 'exportar')->where('recurso', 'Graduados')->exists());
    }

    public function test_exportar_lleva_solo_lo_buscado(): void
    {
        $this->graduado();
        $this->graduado(['nombre_completo' => 'Lucía Pérez', 'ci' => '7654321', 'modalidad' => 'Examen de Grado']);

        $csv = $this->actingAs($this->editor())->get('/api/gestion/graduados/exportar?buscar=lucia')->streamedContent();

        $this->assertStringContainsString('Lucía Pérez', $csv);
        $this->assertStringNotContainsString('Mario Gomez', $csv);
    }

    public function test_el_panel_filtra_sin_distinguir_tildes(): void
    {
        $this->graduado();
        $this->graduado(['nombre_completo' => 'Lucía Pérez', 'ci' => '7654321']);

        $this->actingAs($this->editor())->getJson('/api/gestion/graduados?buscar=PEREZ')
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.nombre_completo', 'Lucía Pérez');
    }

    public function test_crear_editar_y_eliminar_quedan_en_la_bitacora(): void
    {
        $editor = $this->editor();
        $datos = ['nombre_completo' => 'Ana Paz', 'ci' => '999', 'gestion_ingreso' => 'I-2018', 'gestion_egreso' => 'II-2023', 'modalidad' => 'Tesis de Grado'];

        $id = $this->actingAs($editor)->postJson('/api/gestion/graduados', $datos)->assertCreated()->json('data.id');
        $this->actingAs($editor)->putJson("/api/gestion/graduados/{$id}", [...$datos, 'modalidad' => 'Examen de Grado'])->assertOk();
        $this->actingAs($editor)->deleteJson("/api/gestion/graduados/{$id}")->assertOk();

        $acciones = \DB::table('bitacora')->where('recurso', "Graduado #{$id}")->pluck('accion')->all();
        $this->assertSame(['crear', 'editar', 'eliminar'], $acciones);
        $cambios = json_decode(\DB::table('bitacora')->where('recurso', "Graduado #{$id}")->where('accion', 'editar')->value('cambios'), true);
        $this->assertSame(['antes' => 'Tesis de Grado', 'despues' => 'Examen de Grado'], $cambios['modalidad']);
    }

    public function test_el_graduado_registra_y_actualiza_sus_propios_datos(): void
    {
        $cuenta = $this->editor(Rol::USUARIO);
        $datos = ['nombre_completo' => 'Rosa Vaca', 'ci' => '4455667', 'gestion_ingreso' => 'I-2017', 'gestion_egreso' => 'II-2022', 'modalidad' => 'Proyecto de Grado'];

        $this->actingAs($cuenta)->getJson('/api/mi-cuenta/graduado')->assertOk()->assertJsonPath('data', null);

        $this->actingAs($cuenta)->putJson('/api/mi-cuenta/graduado', $datos)->assertCreated();
        $this->actingAs($cuenta)->putJson('/api/mi-cuenta/graduado', [...$datos, 'telefono' => '70011223'])->assertOk();

        $this->assertSame(1, Graduado::count(), 'Actualizar no debe crear un segundo registro');
        $graduado = Graduado::first();
        $this->assertSame($cuenta->id, $graduado->cuenta_id);
        $this->assertSame('70011223', $graduado->telefono);
        $this->actingAs($cuenta)->getJson('/api/mi-cuenta/graduado')->assertJsonPath('data.ci', '4455667');
    }

    public function test_el_graduado_no_puede_usar_el_ci_de_otro(): void
    {
        $this->graduado(['ci' => '1234567']);
        $cuenta = $this->editor(Rol::USUARIO);

        $this->actingAs($cuenta)->putJson('/api/mi-cuenta/graduado', [
            'nombre_completo' => 'Otra Persona', 'ci' => '1234567', 'gestion_ingreso' => 'I-2017', 'gestion_egreso' => 'II-2022', 'modalidad' => 'Tesis de Grado',
        ])->assertUnprocessable()->assertJsonValidationErrors('ci');
    }

    public function test_mis_datos_de_graduado_es_solo_para_el_rol_usuario(): void
    {
        $this->getJson('/api/mi-cuenta/graduado')->assertUnauthorized();
        $this->actingAs($this->editor())->getJson('/api/mi-cuenta/graduado')->assertForbidden();
    }

    public function test_el_directorio_publico_no_expone_datos_personales(): void
    {
        $editor = $this->editor();
        Graduado::create([
            'nombre_completo' => 'Mario Gomez',
            'ci' => '1234567',
            'correo' => 'mario@ejemplo.com',
            'telefono' => '70000000',
            'gestion_ingreso' => 'I-2018',
            'gestion_egreso' => 'II-2023',
            'modalidad' => 'Tesis de Grado',
            'user_id' => $editor->id,
        ]);

        $respuesta = $this->getJson('/api/graduados')->assertOk();

        foreach (['ci', 'correo', 'telefono', 'user_id', 'autor'] as $campo) {
            $respuesta->assertJsonMissingPath("data.0.{$campo}");
        }
        $this->assertStringNotContainsString('1234567', $respuesta->getContent());
        $this->assertStringNotContainsString('mario@ejemplo.com', $respuesta->getContent());
        $this->assertStringNotContainsString($editor->email, $respuesta->getContent());
    }

    public function test_exportar_csv_sin_sesion_da_error(): void
    {
        $this->getJson('/api/gestion/graduados/exportar')
            ->assertUnauthorized();
    }

    public function test_editor_puede_exportar_csv(): void
    {
        $editor = $this->editor();
        Graduado::create([
            'nombre_completo' => 'Mario Gomez',
            'ci' => '1234567',
            'correo' => 'mario@ejemplo.com',
            'telefono' => '70000000',
            'gestion_ingreso' => 'I-2018',
            'gestion_egreso' => 'II-2023',
            'modalidad' => 'Tesis de Grado',
            'titulo_tema' => 'Sistema de información',
            'user_id' => $editor->id,
        ]);

        $response = $this->actingAs($editor)
            ->get('/api/gestion/graduados/exportar');

        $response->assertOk();
        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));
        $content = $response->streamedContent();
        $this->assertStringContainsString("\xEF\xBB\xBF", $content);
        $this->assertStringContainsString('Nombre,CI,Correo', $content);
        $this->assertStringContainsString('"Gestión Ingreso"', $content);
        $this->assertStringContainsString('Mario Gomez', $content);
    }

    public function test_editor_crea_un_graduado(): void
    {
        $editor = $this->editor();

        $datos = [
            'nombre_completo' => 'Carlos Alberto Mendoza Rojas',
            'ci' => '8945123',
            'correo' => 'carlos.mendoza@ejemplo.com',
            'telefono' => '71234567',
            'gestion_ingreso' => 'I-2019',
            'gestion_egreso' => 'II-2024',
            'modalidad' => 'Tesis de Grado',
            'titulo_tema' => 'Optimización de procesos administrativos con IA',
        ];

        $this->actingAs($editor)
            ->postJson('/api/gestion/graduados', $datos)
            ->assertStatus(201)
            ->assertJsonPath('data.ci', '8945123')
            ->assertJsonPath('data.nombre_completo', 'Carlos Alberto Mendoza Rojas');

        $this->assertDatabaseHas('graduados', [
            'ci' => '8945123',
            'nombre_completo' => 'Carlos Alberto Mendoza Rojas',
            'user_id' => $editor->id,
        ]);
    }

    public function test_editor_edita_un_graduado(): void
    {
        $editor = $this->editor();

        $graduado = Graduado::create([
            'nombre_completo' => 'Ana Maria Lopez Flores',
            'ci' => '4567890',
            'correo' => 'ana.lopez@ejemplo.com',
            'telefono' => '78901234',
            'gestion_ingreso' => 'I-2018',
            'gestion_egreso' => 'I-2023',
            'modalidad' => 'Proyecto de Grado',
            'titulo_tema' => 'Plan de marketing digital para pymes',
            'user_id' => $editor->id,
        ]);

        $cambios = [
            'nombre_completo' => 'Ana Maria Lopez Flores de Perez',
            'ci' => '4567890',
            'correo' => 'ana.perez@ejemplo.com',
            'telefono' => '79999999',
            'gestion_ingreso' => 'I-2018',
            'gestion_egreso' => 'I-2023',
            'modalidad' => 'Examen de Grado',
            'titulo_tema' => 'Plan de marketing digital y finanzas',
        ];

        $this->actingAs($editor)
            ->putJson("/api/gestion/graduados/{$graduado->id}", $cambios)
            ->assertOk()
            ->assertJsonPath('data.nombre_completo', 'Ana Maria Lopez Flores de Perez')
            ->assertJsonPath('data.modalidad', 'Examen de Grado');

        $this->assertDatabaseHas('graduados', [
            'id' => $graduado->id,
            'nombre_completo' => 'Ana Maria Lopez Flores de Perez',
            'modalidad' => 'Examen de Grado',
        ]);
    }
}
