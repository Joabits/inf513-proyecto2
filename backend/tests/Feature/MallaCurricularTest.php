<?php

namespace Tests\Feature;

use Database\Seeders\MallaCurricularSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MallaCurricularTest extends TestCase
{
    use RefreshDatabase;

    private function materia(array $malla, string $sigla): array
    {
        foreach ($malla['semestres'] as $semestre) {
            foreach ($semestre['materias'] as $materia) {
                if ($materia['sigla'] === $sigla) {
                    return $materia;
                }
            }
        }

        $this->fail("No existe la materia $sigla");
    }

    public function test_cualquier_visitante_consulta_el_plan_101_4(): void
    {
        $this->seed(MallaCurricularSeeder::class);

        $malla = $this->getJson('/api/malla-curricular')
            ->assertOk()
            ->assertJsonPath('plan.codigo', '101-4')
            ->assertJsonPath('plan.semestres', 10)
            // 46 obligatorias + 1 optativa de graduación, como dice el documento de la Carrera
            ->assertJsonPath('plan.total_materias', 47)
            ->assertJsonPath('plan.total_creditos', 223)
            ->assertJsonCount(10, 'semestres')
            ->json();

        // Los totales por semestre coinciden con los del plan impreso
        $creditos = array_map(fn ($s) => $s['totales']['creditos'], $malla['semestres']);
        $this->assertSame([28, 25, 25, 29, 25, 25, 25, 23, 18, 0], $creditos);
        $this->assertSame(24, $malla['semestres'][0]['totales']['horas_teoricas']);
        $this->assertSame(8, $malla['semestres'][0]['totales']['horas_practicas']);
    }

    public function test_cada_materia_trae_sus_prerrequisitos_y_lo_que_habilita(): void
    {
        $this->seed(MallaCurricularSeeder::class);
        $malla = $this->getJson('/api/malla-curricular')->json();

        $this->assertSame([], $this->materia($malla, 'ADM-100')['prerrequisitos']);
        $this->assertEqualsCanonicalizing(['ECO-100', 'MAT-100'], $this->materia($malla, 'ECO-150')['prerrequisitos']);
        $this->assertEqualsCanonicalizing(['PRE-350', 'ADM-360'], $this->materia($malla, 'FIN-300')['habilita']);
        $this->assertEqualsCanonicalizing(['ADM-450', 'ADM-460'], $this->materia($malla, 'ADM-500')['prerrequisitos']);

        $optativa = $this->materia($malla, 'ADM-620');
        $this->assertTrue($optativa['optativa']);
        $this->assertNull($optativa['creditos']);
        $this->assertEqualsCanonicalizing(['ADM-510', 'ADM-530', 'ADM-520', 'ADM-500'], $optativa['prerrequisitos']);
    }

    public function test_sin_datos_responde_vacio(): void
    {
        $this->getJson('/api/malla-curricular')->assertOk()->assertJsonPath('plan', null)->assertJsonPath('semestres', []);
    }

    public function test_el_seeder_no_duplica_ni_borra_lo_existente(): void
    {
        $this->seed(MallaCurricularSeeder::class);
        $this->seed(MallaCurricularSeeder::class);

        $this->assertDatabaseCount('malla_materias', 51);
        $this->assertDatabaseCount('malla_plan', 1);
    }
}
