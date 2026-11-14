<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use App\Modulos\Noticias\Model as Noticia;
use Database\Seeders\PermisoSeeder;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class NoticiasTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([RolSeeder::class, PermisoSeeder::class]);
        Storage::fake('public');
    }

    private function editor(string $rol = Rol::EDITOR_COMUNICACION): User
    {
        return User::factory()->create([
            'rol_id' => Rol::where('slug', $rol)->value('id'),
        ]);
    }

    private function crearNoticia(array $atributos = []): Noticia
    {
        $usuario = User::factory()->create();

        return Noticia::create([
            'titulo' => 'Título de prueba',
            'resumen' => 'Resumen breve de la noticia para pruebas.',
            'contenido' => 'Contenido extenso y detallado de la noticia para fines de testing.',
            'imagen' => null,
            'publicada' => true,
            'publicada_en' => now(),
            'user_id' => $usuario->id,
            ...$atributos,
        ]);
    }

    public function test_visitante_ve_noticias_publicadas(): void
    {
        $noticia = $this->crearNoticia([
            'titulo' => 'Noticia Pública UAGRM',
            'publicada' => true,
        ]);

        $response = $this->getJson('/api/noticias');

        $response->assertOk()
            ->assertJsonFragment([
                'id' => $noticia->id,
                'titulo' => 'Noticia Pública UAGRM',
                'publicada' => true,
            ]);
    }

    public function test_visitante_no_ve_borradores(): void
    {
        $borrador = $this->crearNoticia([
            'titulo' => 'Noticia en Borrador',
            'publicada' => false,
            'publicada_en' => null,
        ]);

        $response = $this->getJson('/api/noticias');

        $response->assertOk()
            ->assertJsonMissing([
                'id' => $borrador->id,
                'titulo' => 'Noticia en Borrador',
            ]);
    }

    public function test_sin_sesion_no_puede_crear_401(): void
    {
        $response = $this->postJson('/api/noticias', [
            'titulo' => 'Noticia no autorizada',
            'resumen' => 'Resumen sin auth',
            'contenido' => 'Contenido sin auth',
            'publicada' => true,
        ]);

        $response->assertUnauthorized();
    }

    public function test_editor_crea_noticia_201(): void
    {
        $editor = $this->editor();
        $imagen = UploadedFile::fake()->image('portada.jpg', 600, 400);

        $response = $this->actingAs($editor)
            ->post('/api/noticias', [
                'titulo' => 'Nueva Noticia de Tecnología',
                'resumen' => 'La carrera inaugura nuevos laboratorios de computación.',
                'contenido' => 'Texto detallado sobre la inauguración y equipamiento tecnológico de vanguardia.',
                'publicada' => '1',
                'imagen' => $imagen,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.titulo', 'Nueva Noticia de Tecnología')
            ->assertJsonPath('data.publicada', true);

        $this->assertDatabaseHas('noticias', [
            'titulo' => 'Nueva Noticia de Tecnología',
            'user_id' => $editor->id,
            'publicada' => true,
        ]);

        $noticia = Noticia::where('titulo', 'Nueva Noticia de Tecnología')->first();
        $this->assertNotNull($noticia->imagen);
        Storage::disk('public')->assertExists($noticia->imagen);
    }

    public function test_editor_edita_noticia(): void
    {
        $editor = $this->editor();
        $noticia = $this->crearNoticia([
            'titulo' => 'Título Original',
            'user_id' => $editor->id,
        ]);

        $response = $this->actingAs($editor)
            ->post("/api/noticias/{$noticia->id}", [
                'titulo' => 'Título Modificado por el Editor',
                'resumen' => 'Resumen actualizado.',
                'contenido' => 'Contenido modificado correctamente.',
                'publicada' => '0',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.titulo', 'Título Modificado por el Editor')
            ->assertJsonPath('data.publicada', false);

        $this->assertDatabaseHas('noticias', [
            'id' => $noticia->id,
            'titulo' => 'Título Modificado por el Editor',
            'publicada' => false,
        ]);
    }

    public function test_editor_elimina_noticia(): void
    {
        $editor = $this->editor();
        $noticia = $this->crearNoticia([
            'user_id' => $editor->id,
        ]);

        $response = $this->actingAs($editor)
            ->deleteJson("/api/noticias/{$noticia->id}");

        $response->assertOk()
            ->assertJsonPath('mensaje', 'Noticia eliminada correctamente');

        $this->assertDatabaseMissing('noticias', [
            'id' => $noticia->id,
        ]);
    }

    public function test_ver_detalle_noticia_publica(): void
    {
        $noticia = $this->crearNoticia([
            'titulo' => 'Detalle de Noticia',
        ]);

        $response = $this->getJson("/api/noticias/{$noticia->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $noticia->id)
            ->assertJsonPath('data.titulo', 'Detalle de Noticia');
    }

    public function test_valida_campos_obligatorios_en_espanol(): void
    {
        $editor = $this->editor();

        $response = $this->actingAs($editor)
            ->postJson('/api/noticias', [
                'titulo' => '',
                'resumen' => '',
                'contenido' => '',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['titulo', 'resumen', 'contenido'])
            ->assertJsonPath('errors.titulo.0', 'El título es obligatorio.')
            ->assertJsonPath('errors.resumen.0', 'El resumen es obligatorio.')
            ->assertJsonPath('errors.contenido.0', 'El contenido es obligatorio.');
    }
}
