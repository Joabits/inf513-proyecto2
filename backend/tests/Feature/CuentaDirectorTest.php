<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use Database\Seeders\RolSeeder;
use Database\Seeders\UsuarioPruebaSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/** Usuarios de prueba solo en local y cuenta del Director creada desde la consola del servidor. */
class CuentaDirectorTest extends TestCase
{
    use RefreshDatabase;

    private const CLAVE = 'ClaveSegura2026';

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolSeeder::class);
    }

    private function crearDirector(string $correo = 'Ana.Perez@UAGRM.edu.bo', string $clave = self::CLAVE, string $repetida = self::CLAVE)
    {
        return $this->artisan('usuarios:crear-director')
            ->expectsQuestion('Nombre completo', '  Ana   Pérez ')
            ->expectsQuestion('Correo electrónico', $correo)
            ->expectsQuestion('Contraseña (no se muestra al escribir)', $clave)
            ->expectsQuestion('Repita la contraseña', $repetida);
    }

    public function test_en_el_servidor_el_seeder_no_crea_usuarios_de_prueba(): void
    {
        $this->app['env'] = 'production';

        (new UsuarioPruebaSeeder)->run();

        $this->assertSame(0, User::count());
    }

    public function test_en_local_el_seeder_crea_un_usuario_de_prueba_por_rol(): void
    {
        $this->app['env'] = 'local';

        (new UsuarioPruebaSeeder)->run();

        $this->assertSame(4, User::count());
    }

    public function test_crea_el_director_con_la_contrasena_escrita_en_la_consola(): void
    {
        $this->crearDirector()->assertSuccessful();

        $director = User::where('email', 'ana.perez@uagrm.edu.bo')->firstOrFail();
        $this->assertSame('Ana Pérez', $director->name);
        $this->assertSame(Rol::DIRECTOR, $director->rol->slug);
        $this->assertTrue($director->activo);
        $this->assertTrue(Hash::check(self::CLAVE, $director->password));
    }

    public function test_rechaza_una_contrasena_debil_o_que_no_coincide(): void
    {
        $this->crearDirector(clave: '12345678', repetida: '12345678')->assertFailed();
        $this->crearDirector(repetida: 'OtraClave2026')->assertFailed();

        $this->assertSame(0, User::count());
    }

    public function test_convierte_una_cuenta_existente_solo_si_se_confirma(): void
    {
        $existente = User::factory()->create([
            'email' => 'ana.perez@uagrm.edu.bo',
            'rol_id' => Rol::where('slug', Rol::USUARIO)->value('id'),
            'activo' => false,
        ]);
        $pregunta = 'Ya existe una cuenta con ese correo. ¿Convertirla en Director, activarla y cambiarle la contraseña?';

        $this->crearDirector()->expectsConfirmation($pregunta, 'no')->assertFailed();
        $this->assertSame(Rol::USUARIO, $existente->fresh()->rol->slug);

        $this->crearDirector()->expectsConfirmation($pregunta, 'yes')->assertSuccessful();
        $existente->refresh();
        $this->assertSame(Rol::DIRECTOR, $existente->rol->slug);
        $this->assertTrue($existente->activo);
        $this->assertTrue(Hash::check(self::CLAVE, $existente->password));
        $this->assertDatabaseHas('bitacora', ['tipo' => 'accion', 'accion' => 'cambiar_clave']);
    }
}
