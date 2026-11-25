<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use App\Modulos\Graduados\Model as Graduado;
use Database\Seeders\PermisoSeeder;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/** CU-10: el graduado solicita su cuenta desde el portal; la Carrera la aprueba o la rechaza en el panel (CU-18). */
class SolicitudCuentaGraduadoTest extends TestCase
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

    private function solicitud(array $cambios = []): array
    {
        return [
            'nombre_completo' => 'Lucía Pérez Rojas', 'ci' => '7654321', 'correo' => 'Lucia.Perez@Ejemplo.com', 'telefono' => '70012345',
            'gestion_ingreso' => 'I-2017', 'gestion_egreso' => 'II-2022', 'modalidad' => 'Tesis de Grado', 'titulo_tema' => 'Plan de negocios',
            'password' => 'clave2026', 'password_confirmation' => 'clave2026', ...$cambios,
        ];
    }

    public function test_el_graduado_solicita_su_cuenta_y_queda_inactiva(): void
    {
        $this->postJson('/api/graduados/solicitudes', $this->solicitud())->assertCreated();

        $cuenta = User::where('email', 'lucia.perez@ejemplo.com')->firstOrFail();
        $this->assertFalse((bool) $cuenta->activo);
        $this->assertSame(Rol::USUARIO, $cuenta->rol->slug);
        $graduado = Graduado::where('ci', '7654321')->firstOrFail();
        $this->assertSame($cuenta->id, $graduado->cuenta_id);
        $this->assertSame('lucia.perez@ejemplo.com', $graduado->correo);
        $this->assertTrue(DB::table('bitacora')->where('accion', 'solicitar')->where('recurso', "Graduado #{$graduado->id}")->exists());
    }

    public function test_no_puede_ingresar_hasta_que_la_carrera_aprueba_su_cuenta(): void
    {
        $this->postJson('/api/graduados/solicitudes', $this->solicitud())->assertCreated();
        $graduado = Graduado::where('ci', '7654321')->firstOrFail();

        // El ingreso abre sesión solo desde el origen de la SPA (Sanctum), como en AutenticacionTest
        $this->withHeader('Referer', 'http://'.config('sanctum.stateful')[0]);
        $this->postJson('/api/login', ['email' => 'lucia.perez@ejemplo.com', 'password' => 'clave2026'])
            ->assertUnprocessable()->assertJsonPath('errors.email.0', fn ($m) => str_contains($m, 'todavía no fue aprobada'));
        // Con otra contraseña, el mensaje de siempre: no revela que la cuenta existe
        $this->postJson('/api/login', ['email' => 'lucia.perez@ejemplo.com', 'password' => 'otra2026'])
            ->assertUnprocessable()->assertJsonPath('errors.email.0', fn ($m) => ! str_contains($m, 'aprobada'));

        $this->actingAs($this->editor())->patchJson("/api/gestion/graduados/{$graduado->id}/cuenta")
            ->assertOk()->assertJsonPath('data.cuenta_pendiente', false)->assertJsonPath('data.cuenta.activa', true);
        $this->assertTrue(DB::table('bitacora')->where('accion', 'aprobar')->where('recurso', "Graduado #{$graduado->id}")->exists());

        auth()->forgetGuards();
        $this->postJson('/api/login', ['email' => 'lucia.perez@ejemplo.com', 'password' => 'clave2026'])->assertSuccessful();
    }

    public function test_el_directorio_publico_no_muestra_las_solicitudes_pendientes(): void
    {
        $this->postJson('/api/graduados/solicitudes', $this->solicitud())->assertCreated();
        $graduado = Graduado::where('ci', '7654321')->firstOrFail();

        $this->getJson('/api/graduados')->assertOk()->assertJsonCount(0, 'data');
        $this->actingAs($this->editor())->getJson('/api/gestion/graduados')
            ->assertOk()->assertJsonPath('data.0.cuenta_pendiente', true)->assertJsonPath('data.0.cuenta.correo', 'lucia.perez@ejemplo.com');

        $this->actingAs($this->editor())->patchJson("/api/gestion/graduados/{$graduado->id}/cuenta")->assertOk();
        $this->getJson('/api/graduados')->assertOk()->assertJsonCount(1, 'data')->assertJsonMissingPath('data.0.ci');
    }

    public function test_correo_y_ci_repetidos_o_contrasena_debil_no_se_aceptan(): void
    {
        $this->postJson('/api/graduados/solicitudes', $this->solicitud())->assertCreated();

        $this->postJson('/api/graduados/solicitudes', $this->solicitud(['ci' => '1111111']))
            ->assertUnprocessable()->assertJsonValidationErrors('correo');
        $this->postJson('/api/graduados/solicitudes', $this->solicitud(['correo' => 'otra@ejemplo.com']))
            ->assertUnprocessable()->assertJsonValidationErrors('ci');
        $this->postJson('/api/graduados/solicitudes', $this->solicitud(['ci' => '2222222', 'correo' => 'otra@ejemplo.com', 'password' => 'abc', 'password_confirmation' => 'abc']))
            ->assertUnprocessable()->assertJsonValidationErrors('password');
        $this->assertSame(1, Graduado::count());
    }

    public function test_si_llena_el_campo_trampa_responde_igual_pero_no_crea_nada(): void
    {
        $this->postJson('/api/graduados/solicitudes', $this->solicitud(['sitio_web' => 'https://spam.example']))->assertCreated();

        $this->assertSame(0, Graduado::count());
        $this->assertFalse(User::where('email', 'lucia.perez@ejemplo.com')->exists());
    }

    public function test_rechazar_borra_el_registro_y_la_cuenta(): void
    {
        $this->postJson('/api/graduados/solicitudes', $this->solicitud())->assertCreated();
        $graduado = Graduado::where('ci', '7654321')->firstOrFail();

        $this->actingAs($this->editor())->deleteJson("/api/gestion/graduados/{$graduado->id}/solicitud")->assertOk();

        $this->assertSame(0, Graduado::count());
        $this->assertFalse(User::where('email', 'lucia.perez@ejemplo.com')->exists());
        $this->assertTrue(DB::table('bitacora')->where('accion', 'rechazar')->where('recurso', "Graduado #{$graduado->id}")->exists());
    }

    public function test_solo_quien_gestiona_graduados_aprueba_y_solo_si_hay_solicitud(): void
    {
        $this->postJson('/api/graduados/solicitudes', $this->solicitud())->assertCreated();
        $graduado = Graduado::where('ci', '7654321')->firstOrFail();

        $this->patchJson("/api/gestion/graduados/{$graduado->id}/cuenta")->assertUnauthorized();
        $this->actingAs($this->editor(Rol::EDITOR_COMUNICACION))->patchJson("/api/gestion/graduados/{$graduado->id}/cuenta")->assertForbidden();

        $sinCuenta = Graduado::create(['nombre_completo' => 'Mario Gomez', 'ci' => '1234567', 'gestion_ingreso' => 'I-2015',
            'gestion_egreso' => 'II-2020', 'modalidad' => 'Tesis de Grado', 'user_id' => $this->editor()->id]);
        $this->actingAs($this->editor())->patchJson("/api/gestion/graduados/{$sinCuenta->id}/cuenta")->assertUnprocessable();
        $this->actingAs($this->editor())->deleteJson("/api/gestion/graduados/{$sinCuenta->id}/solicitud")->assertUnprocessable();
    }
}
