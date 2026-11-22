<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use App\Modulos\Galeria\Model as GaleriaModel;
use Database\Seeders\PermisoSeeder;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class GaleriaTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([RolSeeder::class, PermisoSeeder::class]);
        Storage::fake('public');
    }

    private function editor(): User
    {
        return User::factory()->create([
            'rol_id' => Rol::where('slug', Rol::EDITOR_COMUNICACION)->value('id'),
        ]);
    }

    public function test_visitante_ve_galeria_publicada(): void
    {
        $editor = $this->editor();
        GaleriaModel::create([
            'titulo' => 'Acto de Colación 2026',
            'descripcion' => 'Entrega de títulos a la promoción.',
            'imagen' => 'galeria/publicada.jpg',
            'publicado' => true,
            'user_id' => $editor->id,
        ]);

        $respuesta = $this->getJson('/api/galeria')->assertOk();

        $respuesta->assertJsonFragment([
            'titulo' => 'Acto de Colación 2026',
            'descripcion' => 'Entrega de títulos a la promoción.',
            'publicado' => true,
        ]);
    }

    public function test_visitante_no_ve_borradores(): void
    {
        $editor = $this->editor();
        $borrador = GaleriaModel::create([
            'titulo' => 'Borrador Confidencial',
            'descripcion' => 'Esta imagen no debe ser visible.',
            'imagen' => 'galeria/borrador.jpg',
            'publicado' => false,
            'user_id' => $editor->id,
        ]);

        $respuesta = $this->getJson('/api/galeria')->assertOk();

        $respuesta->assertJsonMissing([
            'titulo' => 'Borrador Confidencial',
        ]);

        $this->getJson("/api/galeria/{$borrador->id}")->assertNotFound();
    }

    public function test_sin_sesion_no_puede_subir(): void
    {
        $archivo = UploadedFile::fake()->image('intento.jpg');

        $this->postJson('/api/galeria', [
            'titulo' => 'Intento no autorizado',
            'imagen' => $archivo,
            'publicado' => true,
        ])->assertUnauthorized();
    }

    public function test_editor_sube_imagen(): void
    {
        $editor = $this->editor();
        $archivo = UploadedFile::fake()->image('nueva_galeria.jpg');

        $respuesta = $this->actingAs($editor)
            ->postJson('/api/galeria', [
                'titulo' => 'Feria Tecnológica 2026',
                'descripcion' => 'Muestra de proyectos de estudiantes.',
                'imagen' => $archivo,
                'publicado' => true,
            ])
            ->assertCreated();

        $respuesta->assertJsonPath('data.titulo', 'Feria Tecnológica 2026');
        $respuesta->assertJsonPath('data.publicado', true);

        $this->assertDatabaseHas('galerias', [
            'titulo' => 'Feria Tecnológica 2026',
            'user_id' => $editor->id,
            'publicado' => true,
        ]);

        $registro = GaleriaModel::where('titulo', 'Feria Tecnológica 2026')->first();
        $this->assertNotNull($registro);
        Storage::disk('public')->assertExists($registro->imagen);
    }

    public function test_editor_elimina(): void
    {
        $editor = $this->editor();
        $archivo = UploadedFile::fake()->image('para_eliminar.jpg');
        $ruta = $archivo->store('galeria', 'public');

        $galeria = GaleriaModel::create([
            'titulo' => 'Imagen a eliminar',
            'descripcion' => 'Será borrada',
            'imagen' => $ruta,
            'publicado' => true,
            'user_id' => $editor->id,
        ]);

        Storage::disk('public')->assertExists($ruta);

        $this->actingAs($editor)
            ->deleteJson("/api/galeria/{$galeria->id}")
            ->assertOk();

        $this->assertDatabaseMissing('galerias', [
            'id' => $galeria->id,
        ]);

        Storage::disk('public')->assertMissing($ruta);
    }
}
