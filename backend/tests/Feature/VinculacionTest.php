<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use App\Modulos\Vinculacion\Model as Vinculacion;
use Database\Seeders\PermisoSeeder;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VinculacionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([RolSeeder::class, PermisoSeeder::class]);
    }

    private function editor(): User
    {
        return User::factory()->create([
            'rol_id' => Rol::where('slug', Rol::EDITOR_INSTITUCIONAL)->value('id'),
        ]);
    }

    public function test_visitante_ve_vinculaciones_publicadas(): void
    {
        $editor = $this->editor();
        Vinculacion::create([
            'titulo' => 'Convenio con Google',
            'descripcion' => 'Convenio institucional para pasantías.',
            'enlace' => 'https://google.com',
            'publicado' => true,
            'user_id' => $editor->id,
        ]);

        $respuesta = $this->getJson('/api/vinculaciones');

        $respuesta->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.titulo', 'Convenio con Google')
            ->assertJsonMissingPath('data.0.autor');
    }

    public function test_la_pagina_publica_no_muestra_borradores_aunque_haya_sesion(): void
    {
        $editor = $this->editor();
        Vinculacion::create(['titulo' => 'Publicado', 'descripcion' => 'Texto', 'publicado' => true, 'user_id' => $editor->id]);
        Vinculacion::create(['titulo' => 'Borrador', 'descripcion' => 'Texto', 'publicado' => false, 'user_id' => $editor->id]);

        // La página pública: aun con sesión del personal, solo lo publicado
        $this->actingAs($editor)->getJson('/api/vinculaciones')
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.titulo', 'Publicado');

        // El panel pide todas
        $this->actingAs($editor)->getJson('/api/vinculaciones?todas=1')
            ->assertOk()->assertJsonCount(2, 'data');

        // Un visitante no puede pedir los borradores
        auth()->forgetGuards();
        $this->getJson('/api/vinculaciones?todas=1')->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_visitante_no_ve_borradores(): void
    {
        $editor = $this->editor();
        Vinculacion::create([
            'titulo' => 'Borrador de Convenio',
            'descripcion' => 'Aún en negociación.',
            'enlace' => null,
            'publicado' => false,
            'user_id' => $editor->id,
        ]);

        $respuesta = $this->getJson('/api/vinculaciones');

        $respuesta->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_sin_sesion_no_puede_crear(): void
    {
        $datos = [
            'titulo' => 'Nuevo Convenio',
            'descripcion' => 'Convenio sin sesión',
            'publicado' => true,
        ];

        $respuesta = $this->postJson('/api/vinculaciones', $datos);

        $respuesta->assertUnauthorized();
    }

    public function test_editor_crea(): void
    {
        $editor = $this->editor();

        $datos = [
            'titulo' => 'Convenio Marco con Microsoft',
            'descripcion' => 'Desarrollo conjunto de capacitaciones.',
            'enlace' => 'https://microsoft.com',
            'publicado' => true,
        ];

        $respuesta = $this->actingAs($editor)->postJson('/api/vinculaciones', $datos);

        $respuesta->assertCreated()
            ->assertJsonPath('data.titulo', 'Convenio Marco con Microsoft')
            ->assertJsonPath('data.publicado', true);

        $this->assertDatabaseHas('vinculaciones', [
            'titulo' => 'Convenio Marco con Microsoft',
            'user_id' => $editor->id,
        ]);
    }

    public function test_editor_elimina(): void
    {
        $editor = $this->editor();
        $vinculacion = Vinculacion::create([
            'titulo' => 'Convenio a Eliminar',
            'descripcion' => 'Este convenio será eliminado.',
            'publicado' => true,
            'user_id' => $editor->id,
        ]);

        $respuesta = $this->actingAs($editor)->deleteJson("/api/vinculaciones/{$vinculacion->id}");

        $respuesta->assertOk()
            ->assertJsonPath('mensaje', 'Vinculación eliminada correctamente.');

        $this->assertDatabaseMissing('vinculaciones', [
            'id' => $vinculacion->id,
        ]);
    }
}
