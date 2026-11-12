<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use Database\Seeders\PermisoSeeder;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/** «Mi perfil»: cada cuenta cambia su nombre, su correo y su contraseña. */
class PerfilTest extends TestCase
{
    use RefreshDatabase;

    private const CLAVE = 'ClaveActual2026';

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([RolSeeder::class, PermisoSeeder::class]);
    }

    private function cuenta(string $rol = Rol::USUARIO, array $datos = []): User
    {
        return User::factory()->create([
            'name' => 'Ana Pérez',
            'email' => 'ana@uagrm.edu.bo',
            'password' => self::CLAVE,
            'rol_id' => Rol::where('slug', $rol)->value('id'),
            ...$datos,
        ]);
    }

    private function clave(string $actual, string $nueva, ?string $repetida = null): array
    {
        return ['clave_actual' => $actual, 'password' => $nueva, 'password_confirmation' => $repetida ?? $nueva];
    }

    public function test_sin_sesion_no_se_puede_editar_el_perfil(): void
    {
        $this->putJson('/api/perfil', ['nombre' => 'Ana', 'email' => 'ana@uagrm.edu.bo'])->assertUnauthorized();
        $this->putJson('/api/perfil/clave', $this->clave(self::CLAVE, 'NuevaClave2026'))->assertUnauthorized();
    }

    public function test_cualquier_rol_cambia_su_nombre_sin_escribir_la_contrasena(): void
    {
        $cuenta = $this->cuenta(Rol::USUARIO);

        $this->actingAs($cuenta)
            ->putJson('/api/perfil', ['nombre' => '  Ana   María Pérez ', 'email' => 'ana@uagrm.edu.bo'])
            ->assertOk()
            ->assertJsonPath('data.nombre', 'Ana María Pérez');

        $this->assertSame('Ana María Pérez', $cuenta->fresh()->name);
        $this->assertDatabaseHas('bitacora', ['tipo' => 'accion', 'accion' => 'editar_perfil', 'user_id' => $cuenta->id]);
    }

    public function test_cambiar_el_correo_exige_la_contrasena_actual(): void
    {
        $cuenta = $this->cuenta();
        $datos = ['nombre' => 'Ana Pérez', 'email' => 'Nueva@UAGRM.edu.bo'];

        $this->actingAs($cuenta)->putJson('/api/perfil', $datos)->assertUnprocessable()->assertJsonValidationErrors('clave_actual');

        $this->actingAs($cuenta)
            ->putJson('/api/perfil', [...$datos, 'clave_actual' => 'otraClave1'])
            ->assertUnprocessable()
            ->assertJsonPath('errors.clave_actual.0', 'La contraseña es incorrecta.');

        $this->actingAs($cuenta)
            ->putJson('/api/perfil', [...$datos, 'clave_actual' => self::CLAVE])
            ->assertOk()
            ->assertJsonPath('data.email', 'nueva@uagrm.edu.bo');
    }

    public function test_no_puede_usar_el_correo_de_otra_cuenta(): void
    {
        $this->cuenta(datos: ['email' => 'otra@uagrm.edu.bo']);
        $cuenta = $this->cuenta(datos: ['email' => 'ana2@uagrm.edu.bo']);

        $this->actingAs($cuenta)
            ->putJson('/api/perfil', ['nombre' => 'Ana Pérez', 'email' => 'otra@uagrm.edu.bo', 'clave_actual' => self::CLAVE])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_cambia_su_contrasena_escribiendo_la_actual(): void
    {
        $cuenta = $this->cuenta(Rol::EDITOR_COMUNICACION);
        $nueva = 'NuevaClave2026';

        $this->actingAs($cuenta)->putJson('/api/perfil/clave', $this->clave('equivocada1', $nueva))
            ->assertUnprocessable()->assertJsonValidationErrors('clave_actual');
        $this->actingAs($cuenta)->putJson('/api/perfil/clave', $this->clave(self::CLAVE, '12345678'))
            ->assertUnprocessable()->assertJsonValidationErrors('password');
        $this->actingAs($cuenta)->putJson('/api/perfil/clave', $this->clave(self::CLAVE, $nueva, 'OtraClave2026'))
            ->assertUnprocessable()->assertJsonValidationErrors('password');
        $this->actingAs($cuenta)->putJson('/api/perfil/clave', $this->clave(self::CLAVE, self::CLAVE))
            ->assertUnprocessable()->assertJsonValidationErrors('password');

        $this->actingAs($cuenta)->putJson('/api/perfil/clave', $this->clave(self::CLAVE, $nueva))->assertNoContent();

        $this->assertTrue(Hash::check($nueva, $cuenta->fresh()->password));
        $this->assertDatabaseHas('bitacora', ['accion' => 'cambiar_clave', 'user_id' => $cuenta->id, 'detalle' => 'Desde su perfil']);
    }

    public function test_desde_el_perfil_no_se_puede_cambiar_el_rol(): void
    {
        $cuenta = $this->cuenta(Rol::USUARIO);

        $this->actingAs($cuenta)
            ->putJson('/api/perfil', ['nombre' => 'Ana Pérez', 'email' => 'ana@uagrm.edu.bo', 'rol_id' => Rol::where('slug', Rol::DIRECTOR)->value('id')])
            ->assertOk();

        $this->assertSame(Rol::USUARIO, $cuenta->fresh()->rol->slug);
    }
}
