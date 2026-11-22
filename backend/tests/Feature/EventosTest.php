<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use App\Modulos\Eventos\Model as Evento;
use Database\Seeders\PermisoSeeder;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EventosTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([RolSeeder::class, PermisoSeeder::class]);
    }

    private function editor(string $rol = Rol::EDITOR_COMUNICACION): User
    {
        return User::factory()->create(['rol_id' => Rol::where('slug', $rol)->value('id')]);
    }

    private function datos(array $cambios = []): array
    {
        return [
            'titulo' => 'Seminario de Inteligencia Artificial',
            'descripcion' => 'Conferencias y talleres sobre IA y aprendizaje automático.',
            'fecha_inicio' => '2026-12-01 09:00:00',
            'fecha_fin' => '2026-12-02 18:00:00',
            'lugar' => 'Auditorio Central',
            'enlace' => 'https://ejemplo.com/evento',
            'publicado' => true,
            ...$cambios,
        ];
    }

    public function test_visitante_ve_eventos_publicados(): void
    {
        $editor = $this->editor();
        Evento::create([
            'titulo' => 'Feria de Ciencias',
            'descripcion' => 'Exposición de proyectos.',
            'fecha_inicio' => '2026-12-05 10:00:00',
            'fecha_fin' => '2026-12-05 16:00:00',
            'lugar' => 'Campus Universitario',
            'publicado' => true,
            'user_id' => $editor->id,
        ]);

        $response = $this->getJson('/api/eventos');

        $response->assertOk()
            ->assertJsonFragment(['titulo' => 'Feria de Ciencias']);
    }

    public function test_visitante_no_ve_eventos_borradores(): void
    {
        $editor = $this->editor();
        Evento::create([
            'titulo' => 'Borrador Confidencial',
            'descripcion' => 'Evento en planeación.',
            'fecha_inicio' => '2026-12-10 10:00:00',
            'fecha_fin' => '2026-12-10 12:00:00',
            'lugar' => 'Sala de Juntas',
            'publicado' => false,
            'user_id' => $editor->id,
        ]);

        $response = $this->getJson('/api/eventos');

        $response->assertOk()
            ->assertJsonMissing(['titulo' => 'Borrador Confidencial']);
    }

    public function test_sin_sesion_no_puede_crear(): void
    {
        $response = $this->postJson('/api/eventos', $this->datos());

        $response->assertUnauthorized();
    }

    public function test_editor_crea_un_evento(): void
    {
        $editor = $this->editor();

        $response = $this->actingAs($editor)
            ->postJson('/api/eventos', $this->datos());

        $response->assertCreated()
            ->assertJsonPath('data.titulo', 'Seminario de Inteligencia Artificial');

        $this->assertDatabaseHas('eventos', [
            'titulo' => 'Seminario de Inteligencia Artificial',
            'user_id' => $editor->id,
        ]);
    }

    public function test_editor_edita_un_evento(): void
    {
        $editor = $this->editor();
        $evento = Evento::create([
            'titulo' => 'Evento Original',
            'descripcion' => 'Descripción previa.',
            'fecha_inicio' => '2026-12-01 09:00:00',
            'fecha_fin' => '2026-12-01 12:00:00',
            'lugar' => 'Aula Magna',
            'publicado' => true,
            'user_id' => $editor->id,
        ]);

        $response = $this->actingAs($editor)
            ->putJson("/api/eventos/{$evento->id}", $this->datos([
                'titulo' => 'Evento Modificado',
                'lugar' => 'Nuevo Auditorio',
            ]));

        $response->assertOk()
            ->assertJsonPath('data.titulo', 'Evento Modificado');

        $this->assertDatabaseHas('eventos', [
            'id' => $evento->id,
            'titulo' => 'Evento Modificado',
            'lugar' => 'Nuevo Auditorio',
        ]);
    }
}
