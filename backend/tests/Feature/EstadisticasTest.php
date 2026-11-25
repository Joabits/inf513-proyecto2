<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\User;
use Database\Seeders\PermisoSeeder;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class EstadisticasTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([RolSeeder::class, PermisoSeeder::class]);
    }

    private function cuenta(string $rol): User
    {
        return User::factory()->create(['rol_id' => Rol::where('slug', $rol)->value('id')]);
    }

    public function test_solo_quien_tiene_permiso_ve_las_estadisticas(): void
    {
        $this->getJson('/api/gestion/estadisticas')->assertUnauthorized();
        $this->actingAs($this->cuenta(Rol::EDITOR_COMUNICACION))->getJson('/api/gestion/estadisticas')->assertForbidden();
        $this->actingAs($this->cuenta(Rol::DIRECTOR))->getJson('/api/gestion/estadisticas')->assertOk();
    }

    public function test_cuenta_visitas_ingresos_acciones_y_secciones_del_periodo(): void
    {
        $director = $this->cuenta(Rol::DIRECTOR);
        DB::table('visitas')->insert([
            ['pagina' => '/', 'created_at' => now()],
            ['pagina' => '/', 'created_at' => now()],
            ['pagina' => '/noticias', 'created_at' => now()],
            ['pagina' => '/', 'created_at' => now()->subDays(60)], // fuera de los 30 días
        ]);
        foreach ([
            ['ingreso_ok', null, null],
            ['ingreso_fallido', null, null],
            ['ingreso_fallido', null, null],
            ['accion', 'crear', 'Noticia #1'],
            ['acceso', 'GET', 'api/gestion/usuarios'],
            ['acceso', 'GET', 'api/gestion/usuarios/5'],
        ] as [$tipo, $accion, $recurso]) {
            DB::table('bitacora')->insert(['tipo' => $tipo, 'accion' => $accion, 'recurso' => $recurso, 'created_at' => now()]);
        }

        $r = $this->actingAs($director)->getJson('/api/gestion/estadisticas?dias=30')->assertOk();

        $r->assertJsonPath('visitas.total_periodo', 3)
            ->assertJsonPath('visitas.paginas.0', ['pagina' => '/', 'total' => 2])
            ->assertJsonCount(30, 'visitas.por_dia')
            ->assertJsonPath('ingresos', ['correctos' => 1, 'fallidos' => 2])
            ->assertJsonPath('acciones.0', ['accion' => 'crear', 'total' => 1])
            ->assertJsonPath('secciones.0', ['seccion' => 'Usuarios', 'total' => 2])
            ->assertJsonPath('contenido.usuarios_activos', 1);
    }

    public function test_visitas_por_hora_personal_mas_activo_y_dispositivos(): void
    {
        $director = $this->cuenta(Rol::DIRECTOR);
        $editora = User::factory()->create(['name' => 'Ana Editora', 'rol_id' => Rol::where('slug', Rol::EDITOR_COMUNICACION)->value('id')]);
        $hoy = now()->startOfDay();
        DB::table('visitas')->insert([
            ['pagina' => '/', 'created_at' => $hoy->copy()->setTime(10, 15)],
            ['pagina' => '/', 'created_at' => $hoy->copy()->setTime(10, 45)],
            ['pagina' => '/noticias', 'created_at' => $hoy->copy()->setTime(21, 5)],
        ]);
        $chrome = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36';
        $iphone = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1';
        foreach ([
            ['accion', 'crear', $editora], ['accion', 'editar', $editora], ['accion', 'eliminar', $director],
            ['ingreso_ok', null, $editora, $chrome], ['ingreso_ok', null, $director, $chrome], ['ingreso_ok', null, $editora, $iphone],
        ] as $f) {
            DB::table('bitacora')->insert(['tipo' => $f[0], 'accion' => $f[1], 'user_id' => $f[2]->id, 'usuario' => $f[2]->email,
                'navegador' => $f[3] ?? null, 'created_at' => now()]);
        }

        $r = $this->actingAs($director)->getJson('/api/gestion/estadisticas?dias=7')->assertOk();

        $r->assertJsonCount(24, 'visitas.por_hora')
            ->assertJsonPath('visitas.por_hora.10', ['hora' => 10, 'total' => 2])
            ->assertJsonPath('visitas.por_hora.21', ['hora' => 21, 'total' => 1])
            ->assertJsonPath('personal.0', ['nombre' => 'Ana Editora', 'correo' => $editora->email, 'total' => 2])
            ->assertJsonPath('dispositivos.0', ['dispositivo' => 'Chrome en Windows', 'total' => 2])
            ->assertJsonPath('dispositivos.1', ['dispositivo' => 'Safari en iOS', 'total' => 1]);
    }

    public function test_el_periodo_solo_admite_7_30_o_90_dias(): void
    {
        $this->actingAs($this->cuenta(Rol::DIRECTOR))->getJson('/api/gestion/estadisticas?dias=12')
            ->assertUnprocessable()->assertJsonValidationErrors('dias');
    }
}
