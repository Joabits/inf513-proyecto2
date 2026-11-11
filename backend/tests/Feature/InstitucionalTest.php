<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use Database\Seeders\InstitucionalSeeder;
use Database\Seeders\PermisoSeeder;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InstitucionalTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([RolSeeder::class, PermisoSeeder::class, InstitucionalSeeder::class]);
    }

    private function cuenta(string $rol = Rol::EDITOR_INSTITUCIONAL): User
    {
        return User::factory()->create(['rol_id' => Rol::where('slug', $rol)->value('id')]);
    }

    private function contenido(array $cambios = []): array
    {
        $texto = 'Texto institucional de prueba con la extensión suficiente.';

        return [
            'presentacion' => $texto,
            'resena_historica' => "Primer párrafo de la historia.\r\n\r\n\r\n\r\nSegundo párrafo de la historia.",
            'mision' => $texto,
            'vision' => $texto,
            'perfil_profesional' => $texto,
            'campo_ocupacional' => $texto,
            'fecha_creacion' => '1970-05-15',
            'resolucion' => 'Resolución I.C.U. N.º 051/2006',
            'acreditacion' => '',
            ...$cambios,
        ];
    }

    public function test_cualquier_visitante_ve_la_informacion_y_los_hitos_en_orden(): void
    {
        $respuesta = $this->getJson('/api/institucional')->assertOk();

        $respuesta->assertJsonPath('contenido.fecha_creacion', '1970-05-15')
            ->assertJsonPath('contenido.acreditacion', 'Acreditada ante el CEUB')
            ->assertJsonCount(4, 'hitos')
            ->assertJsonPath('hitos.0.anio', 1970)
            ->assertJsonPath('hitos.3.titulo', 'Segunda acreditación nacional');

        $this->assertStringContainsString('Formar profesionales en Administración de Empresas', $respuesta->json('contenido.mision'));
        $this->assertCount(3, explode("\n\n", $respuesta->json('contenido.resena_historica')));
    }

    public function test_solo_quien_tiene_permiso_edita(): void
    {
        $this->putJson('/api/institucional/contenido', $this->contenido())->assertUnauthorized();

        $this->actingAs($this->cuenta(Rol::EDITOR_COMUNICACION))
            ->putJson('/api/institucional/contenido', $this->contenido())
            ->assertForbidden();
    }

    public function test_el_editor_institucional_actualiza_el_contenido(): void
    {
        $editor = $this->cuenta();

        $this->actingAs($editor)
            ->putJson('/api/institucional/contenido', $this->contenido())
            ->assertOk()
            ->assertJsonPath('contenido.resena_historica', "Primer párrafo de la historia.\n\nSegundo párrafo de la historia.")
            ->assertJsonPath('contenido.acreditacion', null);

        $this->assertDatabaseCount('institucional', 1);
        $this->assertDatabaseHas('bitacora', ['user_id' => $editor->id, 'accion' => 'editar', 'recurso' => 'Información institucional: contenido']);
    }

    public function test_valida_el_contenido_con_mensajes_en_espanol(): void
    {
        $this->actingAs($this->cuenta())
            ->putJson('/api/institucional/contenido', $this->contenido([
                'mision' => '',
                'vision' => 'Muy corta',
                'fecha_creacion' => now()->addDay()->toDateString(),
            ]))
            ->assertUnprocessable()
            ->assertJsonPath('errors.mision.0', 'El campo misión es obligatorio.')
            ->assertJsonPath('errors.vision.0', 'El campo visión debe tener al menos 20 caracteres.')
            ->assertJsonPath('errors.fecha_creacion.0', 'La fecha de creación no puede ser posterior a hoy.');
    }

    public function test_guarda_los_hitos_en_orden_cronologico(): void
    {
        $editor = $this->cuenta();

        $this->actingAs($editor)
            ->putJson('/api/institucional/hitos', ['hitos' => [
                ['anio' => 2024, 'titulo' => 'Segunda acreditación', 'descripcion' => null],
                ['anio' => 1970, 'titulo' => 'Fundación', 'descripcion' => 'El 15 de mayo.'],
                ['anio' => 2012, 'titulo' => 'Primera acreditación'],
            ]])
            ->assertOk()
            ->assertJsonPath('hitos.0.titulo', 'Fundación')
            ->assertJsonPath('hitos.1.titulo', 'Primera acreditación')
            ->assertJsonPath('hitos.2.titulo', 'Segunda acreditación');

        $this->assertDatabaseHas('bitacora', ['user_id' => $editor->id, 'recurso' => 'Información institucional: hitos']);
    }

    public function test_valida_los_hitos(): void
    {
        $this->actingAs($this->cuenta())
            ->putJson('/api/institucional/hitos', ['hitos' => [
                ['anio' => 1500, 'titulo' => 'Muy antiguo'],
                ['anio' => now()->year + 1, 'titulo' => 'En el futuro'],
                ['anio' => 2000, 'titulo' => ''],
            ]])
            ->assertUnprocessable()
            ->assertJsonPath('errors', fn ($errores) => $errores['hitos.0.anio'] === ['Escriba un año entre 1880 y '.now()->year.'.']
                && isset($errores['hitos.1.anio'], $errores['hitos.2.titulo']));
    }
}
