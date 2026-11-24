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

    public function test_el_periodo_solo_admite_7_30_o_90_dias(): void
    {
        $this->actingAs($this->cuenta(Rol::DIRECTOR))->getJson('/api/gestion/estadisticas?dias=12')
            ->assertUnprocessable()->assertJsonValidationErrors('dias');
    }
}
