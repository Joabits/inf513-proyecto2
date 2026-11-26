<?php

namespace Tests\Feature;

use App\Models\User;
use App\Modulos\InformacionAcademica\Model as InformacionAcademica;
use App\Modulos\Institucional\Hito;
use App\Modulos\Institucional\Institucional;
use App\Modulos\MallaCurricular\PlanEstudios;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

/** El modelo de datos no tiene tablas sueltas: cada una se relaciona con al menos otra. */
class ModeloDeDatosTest extends TestCase
{
    use RefreshDatabase;

    /** Tablas internas de Laravel que no forman parte del modelo del portal. */
    private const INTERNAS = ['migrations'];

    public function test_ninguna_tabla_queda_suelta(): void
    {
        $tablas = collect(Schema::getTableListing(schemaQualified: false))
            ->reject(fn (string $t) => in_array($t, self::INTERNAS, true) || str_starts_with($t, 'sqlite_'));

        $relacionadas = $tablas->flatMap(fn (string $t) => collect(Schema::getForeignKeys($t))
            ->flatMap(fn (array $fk) => [$t, $fk['foreign_table']]))->unique();

        $this->assertSame([], $tablas->diff($relacionadas)->values()->all(), 'Tablas sin ninguna relación');
        $this->assertNotContains('password_reset_tokens', $tablas->all());
    }

    public function test_todas_las_tablas_forman_un_solo_modelo(): void
    {
        $tablas = collect(Schema::getTableListing(schemaQualified: false))
            ->reject(fn (string $t) => in_array($t, self::INTERNAS, true) || str_starts_with($t, 'sqlite_'))
            ->values();

        $vecinos = $tablas->mapWithKeys(fn (string $t) => [$t => []])->all();
        foreach ($tablas as $t) {
            foreach (Schema::getForeignKeys($t) as $fk) {
                $vecinos[$t][] = $fk['foreign_table'];
                $vecinos[$fk['foreign_table']][] = $t;
            }
        }

        // Recorrido desde users: tiene que alcanzar todas las tablas
        $alcanzadas = ['users' => true];
        $pendientes = ['users'];
        while ($pendientes) {
            foreach ($vecinos[array_pop($pendientes)] as $vecina) {
                if (! isset($alcanzadas[$vecina])) {
                    $alcanzadas[$vecina] = true;
                    $pendientes[] = $vecina;
                }
            }
        }

        $this->assertSame([], $tablas->reject(fn (string $t) => isset($alcanzadas[$t]))->values()->all(), 'Tablas separadas del resto del modelo');
    }

    public function test_el_plan_de_estudios_se_enlaza_a_la_informacion_academica(): void
    {
        $datos = ['mision' => 'M', 'vision' => 'V', 'perfil_profesional' => 'PP', 'objetivos' => 'O'];
        $planDatos = ['codigo' => '101-4', 'nivel' => 'Licenciatura', 'sistema' => 'Semestral', 'semestres' => 10];

        // El plan cargado antes que la sección se enlaza cuando la sección se crea
        $plan = PlanEstudios::create($planDatos);
        $this->assertNull($plan->informacion_academica_id);
        $informacion = InformacionAcademica::create($datos);
        $this->assertSame($informacion->id, $plan->fresh()->informacion_academica_id);

        // Con la sección ya creada, el plan nuevo se enlaza solo
        $plan->delete();
        $this->assertSame($informacion->id, PlanEstudios::create($planDatos)->informacion_academica_id);
    }

    public function test_los_elementos_de_una_lista_se_enlazan_al_contenido_de_su_seccion(): void
    {
        $contenido = Institucional::create([
            'presentacion' => 'P', 'resena_historica' => 'R', 'mision' => 'M', 'vision' => 'V',
            'perfil_profesional' => 'PP', 'campo_ocupacional' => 'CO',
        ]);

        $hito = Hito::create(['anio' => 1970, 'titulo' => 'Creación de la Carrera', 'orden' => 0]);

        $this->assertSame($contenido->id, $hito->institucional_id);
        $this->assertTrue($contenido->hitos->contains($hito));
    }

    public function test_sin_el_contenido_de_la_seccion_no_se_crean_sus_elementos(): void
    {
        $this->expectException(ValidationException::class);

        Hito::create(['anio' => 1970, 'titulo' => 'Creación de la Carrera', 'orden' => 0]);
    }

    public function test_al_eliminar_una_cuenta_se_cierran_sus_sesiones(): void
    {
        $usuario = User::factory()->create();
        DB::table('sessions')->insert([
            'id' => 'sesion-de-prueba', 'user_id' => $usuario->id, 'payload' => '', 'last_activity' => time(),
        ]);

        $usuario->delete();

        $this->assertFalse(DB::table('sessions')->where('id', 'sesion-de-prueba')->exists());
    }
}
