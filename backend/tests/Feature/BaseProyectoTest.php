<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use Database\Seeders\MenuSeeder;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class BaseProyectoTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([RolSeeder::class, MenuSeeder::class]);
    }

    private function usuarioCon(string $rol): User
    {
        return User::factory()->create(['rol_id' => Rol::where('slug', $rol)->value('id')]);
    }

    private function titulosGestion($respuesta): array
    {
        return collect($respuesta->json('gestion'))->pluck('titulo')->all();
    }

    public function test_ping_responde(): void
    {
        $this->getJson('/api/ping')->assertOk()->assertJsonStructure(['mensaje', 'hora_servidor']);
    }

    public function test_sesion_de_visitante_y_de_usuario(): void
    {
        $this->getJson('/api/sesion')->assertOk()->assertJson(['usuario' => null]);

        $this->actingAs($this->usuarioCon(Rol::EDITOR_INSTITUCIONAL))
            ->getJson('/api/sesion')
            ->assertJsonPath('usuario.rol.slug', 'editor_institucional')
            ->assertJsonMissingPath('usuario.password');
    }

    public function test_hay_cuatro_roles_fijos(): void
    {
        $this->assertEqualsCanonicalizing(
            ['director', 'editor_institucional', 'editor_comunicacion', 'usuario'],
            Rol::pluck('slug')->all(),
        );
    }

    public function test_visitante_solo_ve_menu_publico(): void
    {
        $r = $this->getJson('/api/menu')->assertOk();

        $this->assertContains('Inicio', collect($r->json('publico'))->pluck('titulo'));
        $this->assertSame([], $r->json('gestion'));
    }

    public function test_director_ve_administracion(): void
    {
        $r = $this->actingAs($this->usuarioCon(Rol::DIRECTOR))->getJson('/api/menu');

        $this->assertContains('Administración', $this->titulosGestion($r));
        $this->assertNotContains('Mi cuenta', $this->titulosGestion($r));
    }

    public function test_editor_de_comunicacion_solo_ve_comunicacion(): void
    {
        $r = $this->actingAs($this->usuarioCon(Rol::EDITOR_COMUNICACION))->getJson('/api/menu');

        $this->assertSame(['Comunicación'], $this->titulosGestion($r));
        $this->assertSame(
            ['Noticias', 'Eventos académicos', 'Galería multimedia', 'Mensajes de contacto'],
            collect($r->json('gestion.0.hijos'))->pluck('titulo')->all(),
        );
    }

    public function test_editor_institucional_no_ve_administracion_ni_comunicacion(): void
    {
        $r = $this->actingAs($this->usuarioCon(Rol::EDITOR_INSTITUCIONAL))->getJson('/api/menu');

        $this->assertSame(['Contenido institucional', 'Investigación y vinculación'], $this->titulosGestion($r));
    }

    public function test_contador_de_visitas_suma(): void
    {
        $this->postJson('/api/visitas', ['pagina' => '/carrera'])->assertOk()->assertJson(['total' => 1]);
        $this->postJson('/api/visitas', ['pagina' => '/carrera'])->assertJson(['total' => 2]);
        $this->postJson('/api/visitas', ['pagina' => '/'])->assertJson(['total' => 1]);
    }

    public function test_validacion_responde_en_espanol(): void
    {
        $this->postJson('/api/visitas', [])
            ->assertUnprocessable()
            ->assertJsonPath('errors.pagina.0', 'El campo página es obligatorio.');
    }

    public function test_middleware_de_rol_bloquea_a_otros_roles(): void
    {
        Route::middleware(['api', 'auth:sanctum', 'rol:director'])->get('/api/prueba-rol', fn () => 'ok');

        $this->getJson('/api/prueba-rol')->assertUnauthorized();
        $this->actingAs($this->usuarioCon(Rol::EDITOR_COMUNICACION))->getJson('/api/prueba-rol')->assertForbidden();

        $this->app['auth']->forgetGuards();
        $this->actingAs($this->usuarioCon(Rol::DIRECTOR))->getJson('/api/prueba-rol')->assertOk();
    }
}
