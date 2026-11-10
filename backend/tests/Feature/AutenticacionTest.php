<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use Database\Seeders\PermisoSeeder;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AutenticacionTest extends TestCase
{
    use RefreshDatabase;

    private const CLAVE = 'clave-de-prueba';

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([RolSeeder::class, PermisoSeeder::class]);
        $this->withHeader('Referer', 'http://'.config('sanctum.stateful')[0]);
    }

    private function usuario(array $datos = []): User
    {
        return User::factory()->create([
            'email' => 'editor@cae.test',
            'password' => self::CLAVE,
            'rol_id' => Rol::where('slug', Rol::EDITOR_COMUNICACION)->value('id'),
            ...$datos,
        ]);
    }

    private function ingresar(string $clave = self::CLAVE, string $correo = 'editor@cae.test')
    {
        return $this->postJson('/api/login', ['email' => $correo, 'password' => $clave]);
    }

    private function registros(string $tipo): int
    {
        return DB::table('bitacora')->where('tipo', $tipo)->count();
    }

    public function test_inicia_sesion_y_lo_registra_en_la_bitacora(): void
    {
        $usuario = $this->usuario();

        $this->ingresar()->assertNoContent();

        $this->assertAuthenticatedAs($usuario);
        $this->assertSame(1, $this->registros('ingreso_ok'));
    }

    public function test_el_correo_no_distingue_mayusculas(): void
    {
        $usuario = $this->usuario();

        $this->ingresar(correo: 'Editor@CAE.test')->assertNoContent();

        $this->assertAuthenticatedAs($usuario);
    }

    public function test_regenera_la_sesion_al_iniciar(): void
    {
        $this->usuario();
        $this->startSession();
        $anterior = session()->getId();

        $this->ingresar()->assertNoContent();

        $this->assertNotSame($anterior, session()->getId());
    }

    public function test_clave_incorrecta_responde_en_espanol_y_registra_el_fallo(): void
    {
        $this->usuario();

        $this->ingresar('otra-clave')
            ->assertUnprocessable()
            ->assertJsonPath('errors.email.0', 'Estas credenciales no coinciden con nuestros registros.');

        $this->assertGuest();
        $this->assertSame(1, $this->registros('ingreso_fallido'));
    }

    public function test_cuenta_desactivada_recibe_el_mismo_error(): void
    {
        $this->usuario(['activo' => false]);

        $this->ingresar()
            ->assertUnprocessable()
            ->assertJsonPath('errors.email.0', 'Estas credenciales no coinciden con nuestros registros.');

        $this->assertGuest();
    }

    public function test_valida_los_campos_en_espanol(): void
    {
        $this->postJson('/api/login', [])
            ->assertUnprocessable()
            ->assertJsonPath('errors.email.0', 'El campo correo electrónico es obligatorio.')
            ->assertJsonPath('errors.password.0', 'El campo contraseña es obligatorio.');
    }

    public function test_bloquea_tras_cinco_intentos_aunque_la_clave_sea_correcta(): void
    {
        $this->usuario();

        foreach (range(1, 5) as $intento) {
            $this->ingresar('otra-clave')->assertUnprocessable();
        }

        $this->ingresar()
            ->assertTooManyRequests()
            ->assertJsonPath('errors.email.0', fn (string $mensaje) => str_starts_with($mensaje, 'Demasiados intentos'));

        $this->assertGuest();
        $this->assertSame(5, $this->registros('ingreso_fallido'));
    }

    public function test_un_ingreso_correcto_reinicia_los_intentos(): void
    {
        $this->usuario();

        foreach (range(1, 4) as $intento) {
            $this->ingresar('otra-clave')->assertUnprocessable();
        }
        $this->ingresar()->assertNoContent();
        $this->postJson('/api/logout')->assertNoContent();
        $this->app['auth']->forgetGuards();

        foreach (range(1, 5) as $intento) {
            $this->ingresar('otra-clave')->assertUnprocessable();
        }
    }

    public function test_rechaza_peticiones_de_origenes_no_autorizados(): void
    {
        $this->usuario();
        $this->defaultHeaders = [];

        $this->ingresar()->assertForbidden();

        $this->assertSame(0, $this->registros('ingreso_ok'));
    }

    public function test_cierra_la_sesion_y_lo_registra_en_la_bitacora(): void
    {
        $this->usuario();
        $this->ingresar()->assertNoContent();

        $this->postJson('/api/logout')->assertNoContent();

        $this->assertGuest('web');
        $this->assertSame(1, $this->registros('salida'));
    }

    public function test_login_y_logout_no_cuentan_como_recursos_accedidos(): void
    {
        $this->usuario();
        $this->ingresar()->assertNoContent();
        $this->postJson('/api/logout')->assertNoContent();

        $this->assertSame(0, $this->registros('acceso'));
    }

    public function test_cerrar_sesion_exige_haber_iniciado(): void
    {
        $this->postJson('/api/logout')->assertUnauthorized();
    }
}
