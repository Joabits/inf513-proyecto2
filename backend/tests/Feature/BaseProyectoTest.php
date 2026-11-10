<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use Database\Seeders\MenuSeeder;
use Database\Seeders\PermisoSeeder;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class BaseProyectoTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([RolSeeder::class, PermisoSeeder::class, MenuSeeder::class]);
    }

    private function usuarioCon(string $rol): User
    {
        return User::factory()->create(['rol_id' => Rol::where('slug', $rol)->value('id')]);
    }

    private function titulosGestion($respuesta): array
    {
        return collect($respuesta->json('gestion'))->pluck('titulo')->all();
    }

    // ---------- Sistema ----------

    public function test_ping_responde(): void
    {
        $this->getJson('/api/ping')->assertOk()->assertJsonStructure(['mensaje', 'hora_servidor']);
    }

    public function test_sesion_de_visitante_y_de_usuario_con_permisos(): void
    {
        $this->getJson('/api/sesion')->assertOk()->assertJson(['usuario' => null]);

        $r = $this->actingAs($this->usuarioCon(Rol::EDITOR_COMUNICACION))->getJson('/api/sesion');

        $r->assertJsonPath('usuario.rol.slug', 'editor_comunicacion')->assertJsonMissingPath('usuario.password');
        $this->assertContains('noticias.crear', $r->json('usuario.permisos'));
        $this->assertNotContains('usuarios.ver', $r->json('usuario.permisos'));
    }

    // ---------- Roles y matriz de acceso ----------

    public function test_hay_cuatro_roles_fijos(): void
    {
        $this->assertEqualsCanonicalizing(
            ['director', 'editor_institucional', 'editor_comunicacion', 'usuario'],
            Rol::pluck('slug')->all(),
        );
    }

    public function test_matriz_de_acceso_por_recurso_y_accion(): void
    {
        $director = $this->usuarioCon(Rol::DIRECTOR);
        $institucional = $this->usuarioCon(Rol::EDITOR_INSTITUCIONAL);
        $comunicacion = $this->usuarioCon(Rol::EDITOR_COMUNICACION);
        $usuario = $this->usuarioCon(Rol::USUARIO);

        $this->assertTrue($director->tienePermiso('usuarios.eliminar'));
        $this->assertTrue($director->tienePermiso('noticias.crear'));
        $this->assertFalse($director->tienePermiso('mi_graduado.editar'));

        $this->assertTrue($institucional->tienePermiso('investigacion.editar'));
        $this->assertFalse($institucional->tienePermiso('noticias.crear'));

        $this->assertTrue($comunicacion->tienePermiso('noticias.eliminar'));
        $this->assertFalse($comunicacion->tienePermiso('bitacora.ver'));

        $this->assertSame(['mi_graduado.ver', 'mi_graduado.editar'], $usuario->permisos());
    }

    public function test_usuario_desactivado_no_tiene_permisos(): void
    {
        $director = $this->usuarioCon(Rol::DIRECTOR);
        $director->update(['activo' => false]);

        $this->assertSame([], $director->fresh()->permisos());
    }

    public function test_middleware_de_permiso_bloquea_acciones_no_permitidas(): void
    {
        Route::middleware(['api', 'auth:sanctum', 'permiso:noticias.crear'])->post('/api/prueba-permiso', fn () => 'ok');

        $this->postJson('/api/prueba-permiso')->assertUnauthorized();
        $this->actingAs($this->usuarioCon(Rol::EDITOR_INSTITUCIONAL))->postJson('/api/prueba-permiso')->assertForbidden();

        $this->app['auth']->forgetGuards();
        $this->actingAs($this->usuarioCon(Rol::EDITOR_COMUNICACION))->postJson('/api/prueba-permiso')->assertOk();
    }

    // ---------- Menú dinámico ----------

    public function test_visitante_solo_ve_menu_publico(): void
    {
        $r = $this->getJson('/api/menu')->assertOk();

        $this->assertContains('Inicio', collect($r->json('publico'))->pluck('titulo'));
        $this->assertSame([], $r->json('gestion'));
    }

    public function test_director_ve_administracion_y_no_mi_cuenta(): void
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

    public function test_quitar_un_permiso_quita_la_opcion_del_menu(): void
    {
        $rol = Rol::where('slug', Rol::EDITOR_COMUNICACION)->first();
        $rol->permisos()->detach($rol->permisos()->where('slug', 'galeria.ver')->value('permisos.id'));

        $r = $this->actingAs($this->usuarioCon(Rol::EDITOR_COMUNICACION))->getJson('/api/menu');

        $this->assertNotContains('Galería multimedia', collect($r->json('gestion.0.hijos'))->pluck('titulo'));
    }

    // ---------- Visitas (trigger) ----------

    public function test_contador_de_visitas_lo_mantiene_el_trigger(): void
    {
        $this->postJson('/api/visitas', ['pagina' => '/carrera'])->assertOk()->assertJson(['total' => 1]);
        $this->postJson('/api/visitas', ['pagina' => '/carrera'])->assertJson(['total' => 2]);
        $this->postJson('/api/visitas', ['pagina' => '/'])->assertJson(['total' => 1]);

        $this->assertSame(3, DB::table('visitas')->count());
        $this->assertSame(2, (int) DB::table('visitas_pagina')->where('pagina', '/carrera')->value('total'));
    }

    public function test_validacion_responde_en_espanol(): void
    {
        $this->postJson('/api/visitas', [])
            ->assertUnprocessable()
            ->assertJsonPath('errors.pagina.0', 'El campo página es obligatorio.');
    }

    // ---------- Bitácora ----------

    public function test_trigger_audita_cambios_de_usuarios(): void
    {
        $usuario = $this->usuarioCon(Rol::USUARIO);
        $usuario->update(['rol_id' => Rol::where('slug', Rol::EDITOR_COMUNICACION)->value('id')]);
        $usuario->update(['activo' => false]);

        $acciones = DB::table('bitacora')->where('tipo', 'auditoria')->orderBy('id')->pluck('accion')->all();
        $this->assertSame(['crear_usuario', 'cambiar_rol', 'desactivar_usuario'], $acciones);
        $this->assertSame('Usuario -> Editor de Comunicación', DB::table('bitacora')->where('accion', 'cambiar_rol')->value('detalle'));
    }

    public function test_se_registran_los_recursos_accedidos_con_ip(): void
    {
        Route::middleware('api')->get('/api/noticias-prueba', fn () => []);

        $this->getJson('/api/noticias-prueba')->assertOk();
        $this->getJson('/api/menu')->assertOk(); // ignorada: la pide cada página

        $accesos = DB::table('bitacora')->where('tipo', 'acceso')->get();
        $this->assertCount(1, $accesos);
        $this->assertSame('api/noticias-prueba', $accesos[0]->recurso);
        $this->assertSame('GET', $accesos[0]->accion);
        $this->assertSame('127.0.0.1', $accesos[0]->ip);
    }
}
