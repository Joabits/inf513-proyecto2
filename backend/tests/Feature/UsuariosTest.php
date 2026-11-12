<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use Database\Seeders\PermisoSeeder;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UsuariosTest extends TestCase
{
    use RefreshDatabase;

    private const URL = '/api/gestion/usuarios';

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([RolSeeder::class, PermisoSeeder::class]);
    }

    private function rol(string $slug): int
    {
        return Rol::where('slug', $slug)->value('id');
    }

    private function cuenta(string $rol = Rol::EDITOR_INSTITUCIONAL, array $datos = []): User
    {
        return User::factory()->create(['rol_id' => $this->rol($rol), ...$datos]);
    }

    private function director(): User
    {
        return $this->cuenta(Rol::DIRECTOR);
    }

    private function nueva(array $cambios = []): array
    {
        return [
            'nombre' => '  Adriana   Quiroga  ',
            'email' => 'Adriana.Quiroga@UAGRM.edu.bo',
            'rol_id' => $this->rol(Rol::EDITOR_COMUNICACION),
            'password' => 'Comunica2026',
            'password_confirmation' => 'Comunica2026',
            ...$cambios,
        ];
    }

    public function test_solo_quien_tiene_permiso_gestiona_usuarios(): void
    {
        $this->getJson(self::URL)->assertUnauthorized();

        $this->actingAs($this->cuenta(Rol::EDITOR_INSTITUCIONAL))->getJson(self::URL)->assertForbidden();
        $this->actingAs($this->cuenta(Rol::EDITOR_COMUNICACION))->postJson(self::URL, $this->nueva())->assertForbidden();
    }

    public function test_el_director_ve_las_cuentas_con_su_rol_y_ultimo_ingreso(): void
    {
        $director = $this->director();
        $editor = $this->cuenta(Rol::EDITOR_INSTITUCIONAL, ['name' => 'Higor Encinas']);
        DB::table('bitacora')->insert(['user_id' => $editor->id, 'tipo' => 'ingreso_ok', 'created_at' => '2026-11-10 08:30:00']);

        $respuesta = $this->actingAs($director)->getJson(self::URL)->assertOk();

        $fila = collect($respuesta->json('data'))->firstWhere('id', $editor->id);
        $this->assertSame('Higor Encinas', $fila['nombre']);
        $this->assertSame(Rol::EDITOR_INSTITUCIONAL, $fila['rol']['slug']);
        $this->assertTrue($fila['activo']);
        $this->assertStringStartsWith('2026-11-10T08:30:00', $fila['ultimo_ingreso']);
        $this->assertFalse($fila['es_usted']);
        $this->assertTrue(collect($respuesta->json('data'))->firstWhere('id', $director->id)['es_usted']);

        $this->actingAs($director)->getJson(self::URL.'/roles')->assertOk()->assertJsonCount(4, 'data');
    }

    public function test_crea_una_cuenta_con_correo_en_minusculas_y_clave_cifrada(): void
    {
        $respuesta = $this->actingAs($this->director())->postJson(self::URL, $this->nueva())->assertCreated();

        $usuario = User::findOrFail($respuesta->json('data.id'));
        $this->assertSame('Adriana Quiroga', $usuario->name);
        $this->assertSame('adriana.quiroga@uagrm.edu.bo', $usuario->email);
        $this->assertTrue(Hash::check('Comunica2026', $usuario->password));
        $this->assertNotSame('Comunica2026', $usuario->password);
        $this->assertTrue($usuario->activo);
        $this->assertSame(Rol::EDITOR_COMUNICACION, $respuesta->json('data.rol.slug'));
        $respuesta->assertJsonMissingPath('data.password');
    }

    public function test_valida_los_datos_con_mensajes_en_espanol(): void
    {
        $this->cuenta(Rol::USUARIO, ['email' => 'adriana.quiroga@uagrm.edu.bo']);

        $this->actingAs($this->director())
            ->postJson(self::URL, $this->nueva([
                'nombre' => 'A',
                'rol_id' => 999,
                'password' => 'corta',
                'password_confirmation' => 'otra',
            ]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['nombre', 'rol_id', 'password'])
            ->assertJsonPath('errors.email.0', 'Ya existe una cuenta con ese correo electrónico.')
            ->assertJsonPath('errors.rol_id.0', 'El rol elegido no existe.');

        $this->actingAs($this->director())
            ->postJson(self::URL, $this->nueva(['password' => 'solotexto', 'password_confirmation' => 'solotexto']))
            ->assertUnprocessable()
            ->assertJsonPath('errors.password.0', 'La contraseña debe contener al menos un número.');
    }

    public function test_edita_nombre_correo_y_rol_y_registra_la_edicion(): void
    {
        $director = $this->director();
        $editor = $this->cuenta(Rol::EDITOR_COMUNICACION, ['email' => 'jenny@cae.test']);

        $this->actingAs($director)
            ->putJson(self::URL."/{$editor->id}", [
                'nombre' => 'Jenny Padilla Rivero',
                'email' => 'JENNY@cae.test',
                'rol_id' => $this->rol(Rol::EDITOR_INSTITUCIONAL),
            ])
            ->assertOk()
            ->assertJsonPath('data.nombre', 'Jenny Padilla Rivero')
            ->assertJsonPath('data.rol.slug', Rol::EDITOR_INSTITUCIONAL);

        $this->assertDatabaseHas('users', ['id' => $editor->id, 'email' => 'jenny@cae.test']);
        $this->assertDatabaseHas('bitacora', ['user_id' => $director->id, 'tipo' => 'accion', 'accion' => 'editar', 'recurso' => "User #{$editor->id}"]);
        // El cambio de rol lo registra el trigger de la tabla users
        $this->assertDatabaseHas('bitacora', ['tipo' => 'auditoria', 'accion' => 'cambiar_rol', 'recurso' => "Usuario #{$editor->id}"]);
    }

    public function test_nadie_se_quita_el_acceso_a_si_mismo(): void
    {
        $director = $this->director();
        $this->director(); // hay otro Director: el bloqueo es por ser su propia cuenta

        $this->actingAs($director)
            ->putJson(self::URL."/{$director->id}", ['nombre' => $director->name, 'email' => $director->email, 'rol_id' => $this->rol(Rol::USUARIO)])
            ->assertUnprocessable()
            ->assertJsonPath('errors.rol_id.0', 'No puede cambiar su propio rol.');

        $this->actingAs($director)->patchJson(self::URL."/{$director->id}/estado", ['activo' => false])
            ->assertUnprocessable()
            ->assertJsonPath('errors.activo.0', 'No puede desactivar su propia cuenta.');

        $this->actingAs($director)->deleteJson(self::URL."/{$director->id}")
            ->assertUnprocessable()
            ->assertJsonPath('errors.usuario.0', 'No puede eliminar su propia cuenta.');

        // Sí puede corregir su propio nombre
        $this->actingAs($director)
            ->putJson(self::URL."/{$director->id}", ['nombre' => 'Freddy Fuentes Soliz', 'email' => $director->email, 'rol_id' => $this->rol(Rol::DIRECTOR)])
            ->assertOk();
    }

    public function test_siempre_queda_un_director_activo(): void
    {
        $unico = $this->director();
        // Un usuario con el permiso usuarios.* pero que no es Director (si alguien cambia la matriz)
        $otro = $this->cuenta(Rol::USUARIO);
        $permisos = DB::table('permisos')->where('recurso', 'usuarios')->pluck('id');
        DB::table('rol_permiso')->insert($permisos->map(fn ($id) => ['rol_id' => $this->rol(Rol::USUARIO), 'permiso_id' => $id])->all());

        $this->actingAs($otro)->patchJson(self::URL."/{$unico->id}/estado", ['activo' => false])
            ->assertUnprocessable()
            ->assertJsonPath('errors.activo.0', 'Es el único Director de Carrera activo: no se puede desactivar.');

        $this->actingAs($otro)
            ->putJson(self::URL."/{$unico->id}", ['nombre' => $unico->name, 'email' => $unico->email, 'rol_id' => $this->rol(Rol::USUARIO)])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('rol_id');

        $this->actingAs($otro)->deleteJson(self::URL."/{$unico->id}")->assertUnprocessable()->assertJsonValidationErrors('usuario');

        $this->assertTrue($unico->fresh()->activo);
    }

    public function test_desactivar_quita_permisos_y_cierra_sus_sesiones(): void
    {
        config(['session.driver' => 'database']);
        $editor = $this->cuenta(Rol::EDITOR_INSTITUCIONAL);
        DB::table('sessions')->insert(['id' => 'sesion-abierta', 'user_id' => $editor->id, 'payload' => '', 'last_activity' => time()]);

        $this->actingAs($this->director())->patchJson(self::URL."/{$editor->id}/estado", ['activo' => false])
            ->assertOk()
            ->assertJsonPath('data.activo', false);

        $this->assertSame([], $editor->fresh()->permisos());
        $this->assertDatabaseMissing('sessions', ['id' => 'sesion-abierta']);
        $this->assertDatabaseHas('bitacora', ['tipo' => 'auditoria', 'accion' => 'desactivar_usuario']);

        $this->actingAs($this->director())->patchJson(self::URL."/{$editor->id}/estado", ['activo' => true])->assertOk();
        $this->assertContains('institucional.editar', $editor->fresh()->permisos());
    }

    public function test_cambia_la_clave_sin_guardarla_en_la_bitacora(): void
    {
        $director = $this->director();
        $editor = $this->cuenta();

        $this->actingAs($director)
            ->putJson(self::URL."/{$editor->id}/clave", ['password' => 'Nueva2026', 'password_confirmation' => 'Nueva2026'])
            ->assertNoContent();

        $this->assertTrue(Hash::check('Nueva2026', $editor->fresh()->password));
        $this->assertDatabaseHas('bitacora', ['user_id' => $director->id, 'accion' => 'cambiar_clave', 'recurso' => "User #{$editor->id}"]);
        $this->assertDatabaseMissing('bitacora', ['detalle' => 'Nueva2026']);

        $this->actingAs($director)
            ->putJson(self::URL."/{$editor->id}/clave", ['password' => 'Nueva2026', 'password_confirmation' => 'Distinta2026'])
            ->assertUnprocessable()
            ->assertJsonPath('errors.password.0', 'La confirmación de contraseña no coincide.');
    }

    public function test_elimina_una_cuenta(): void
    {
        $editor = $this->cuenta();

        $this->actingAs($this->director())->deleteJson(self::URL."/{$editor->id}")->assertNoContent();

        $this->assertModelMissing($editor);
        $this->assertDatabaseHas('bitacora', ['tipo' => 'auditoria', 'accion' => 'eliminar_usuario', 'recurso' => "Usuario #{$editor->id}"]);
    }
}
