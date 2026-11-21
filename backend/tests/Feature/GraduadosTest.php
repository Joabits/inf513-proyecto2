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
            ->assertJsonPath('data.0.nombre_completo', 'Mario Gomez');
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
