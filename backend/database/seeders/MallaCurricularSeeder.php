<?php

namespace Database\Seeders;

use App\Modulos\MallaCurricular\Materia;
use App\Modulos\MallaCurricular\PlanEstudios;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Plan de estudios 101-4 de Administración de Empresas, transcrito del documento
 * «Solicitud de información y contenidos» que entregó la Carrera (páginas del plan y la malla).
 * En el original, la sigla de Administración de Comercialización figura como «ICOM-300»:
 * es una errata de COM-300, la sigla que piden como prerrequisito las materias de sexto semestre.
 * Se escribieron completos tres nombres que el documento abrevia: «Psicología Social e Ind.»,
 * «Proceso. de Datos I» y «Prep. y Evaluación de Proyectos».
 * Solo se carga si no hay materias, para no borrar lo que edite el personal (CU-16).
 */
class MallaCurricularSeeder extends Seeder
{
    /** semestre => [sigla, nombre, horas teóricas, horas prácticas, créditos, prerrequisitos] */
    private const MATERIAS = [
        1 => [
            ['ADM-100', 'Administración I', 4, 2, 5, []],
            ['CPA-100', 'Contabilidad I', 4, 2, 5, []],
            ['ECO-100', 'Introducción a la Economía', 4, 2, 5, []],
            ['INV-100', 'Introducción a la Investigación', 4, 0, 4, []],
            ['MAT-100', 'Cálculo I', 4, 2, 5, []],
            ['CJS-100', 'Administración Tributaria', 4, 0, 4, []],
        ],
        2 => [
            ['ADM-150', 'Administración II', 4, 2, 5, ['ADM-100']],
            ['CPA-150', 'Contabilidad II', 4, 2, 5, ['CPA-100']],
            ['ECO-150', 'Microeconomía I', 4, 2, 5, ['ECO-100', 'MAT-100']],
            ['MAT-150', 'Cálculo II', 4, 2, 5, ['MAT-100']],
            ['PSI-150', 'Psicología Social e Industrial', 4, 2, 5, ['INV-100']],
        ],
        3 => [
            ['ADM-200', 'Organización y Sistemas', 4, 2, 5, ['ADM-150']],
            ['CPA-200', 'Contabilidad III', 4, 2, 5, ['CPA-150']],
            ['ECO-200', 'Microeconomía II', 4, 2, 5, ['ECO-150', 'MAT-150']],
            ['MAT-200', 'Álgebra Lineal y Teoría Matricial', 4, 2, 5, ['MAT-150']],
            ['MAT-210', 'Estadística I', 4, 2, 5, ['MAT-150']],
        ],
        4 => [
            ['CJS-250', 'Legislación Laboral y Empresarial', 4, 0, 4, ['CPA-150']],
            ['MAT-250', 'Ingeniería Económica', 4, 2, 5, ['MAT-200']],
            ['ADM-250', 'Administración Pública', 4, 2, 5, ['ADM-200']],
            ['CPA-250', 'Costos I', 4, 2, 5, ['CPA-200', 'CJS-100']],
            ['ECO-250', 'Macroeconomía', 4, 2, 5, ['ECO-200', 'MAT-200']],
            ['MAT-260', 'Estadística II', 4, 2, 5, ['MAT-210']],
        ],
        5 => [
            ['FIN-300', 'Administración Financiera I', 4, 2, 5, ['MAT-250', 'ADM-250']],
            ['COM-300', 'Administración de Comercialización', 4, 2, 5, ['ECO-250', 'MAT-260']],
            ['ADM-300', 'Administración de Personal I', 4, 2, 5, ['CJS-250', 'ADM-250']],
            ['ADM-310', 'Administración de Producción I', 4, 2, 5, ['CPA-250', 'MAT-260']],
            ['PSI-300', 'Psicología', 4, 2, 5, ['PSI-150', 'ADM-200']],
        ],
        6 => [
            ['PRE-350', 'Presupuesto y Control', 4, 2, 5, ['FIN-300']],
            ['COM-350', 'Investigación de Mercados', 4, 2, 5, ['COM-300', 'PSI-300']],
            ['ADM-350', 'Administración de Personal II', 4, 2, 5, ['ADM-300', 'PSI-300']],
            ['ADM-360', 'Administración de Producción II', 4, 2, 5, ['FIN-300', 'ADM-310']],
            ['MAT-350', 'Procesamiento de Datos I', 4, 2, 5, ['MAT-260']],
        ],
        7 => [
            ['FIN-400', 'Administración Financiera II', 4, 2, 5, ['PRE-350', 'COM-350']],
            ['COM-400', 'Estrategia Comercial', 4, 2, 5, ['PRE-350', 'COM-350']],
            ['MAT-400', 'Investigación Operativa', 4, 2, 5, ['PRE-350', 'ADM-360']],
            ['CPA-400', 'Auditoría Operativa', 4, 2, 5, ['ADM-350', 'MAT-350']],
            ['INV-400', 'Metodología de la Investigación', 4, 2, 5, ['ADM-350', 'MAT-350']],
        ],
        8 => [
            ['FIN-450', 'Administración Financiera III', 4, 2, 5, ['FIN-400', 'CPA-400']],
            ['ADM-450', 'Práctica Empresarial', 4, 2, 5, ['FIN-400', 'COM-400']],
            ['ECO-450', 'Preparación y Evaluación de Proyectos', 4, 2, 5, ['FIN-400', 'MAT-400']],
            ['COM-450', 'Comercio Internacional', 4, 2, 5, ['FIN-400', 'COM-400']],
            ['ADM-460', 'Realidad Empresarial', 2, 2, 3, ['INV-400', 'CPA-400']],
        ],
        9 => [
            ['ADM-510', 'Gerencia Operativa', 4, 2, 5, ['FIN-450', 'COM-450']],
            ['ADM-530', 'Política y Estrategia Empresarial', 4, 2, 5, ['FIN-450', 'COM-450']],
            ['ADM-520', 'Liderazgo y Negociación', 4, 2, 5, ['ADM-450']],
            ['ADM-500', 'Taller de Investigación de Grado', 2, 2, 3, ['ADM-450', 'ADM-460']],
        ],
    ];

    /** Décimo semestre: materias optativas de graduación (el estudiante elige una sola). */
    private const OPTATIVAS = ['ADM-600', 'ADM-610', 'ADM-620', 'ADM-630', 'ADM-640'];

    public function run(): void
    {
        if (! PlanEstudios::exists()) {
            PlanEstudios::create([
                'codigo' => '101-4',
                'nivel' => 'Licenciatura',
                'sistema' => 'Semestralizado',
                'semestres' => 10,
                'titulaciones' => "Técnico Universitario Medio: al concluir el 4.º semestre\nTécnico Universitario Superior: al concluir el 6.º semestre",
                'nota_graduacion' => 'Materias optativas de graduación según la RV N.º 070/98 del 29 de mayo de 1998: el estudiante debe elegir una sola opción y cursarla después de aprobar todas las materias del 9.º semestre.',
            ]);
        }

        if (Materia::exists()) {
            return;
        }

        DB::transaction(function () {
            $ids = [];

            foreach (self::MATERIAS as $semestre => $materias) {
                foreach ($materias as $orden => [$sigla, $nombre, $ht, $hp, $cr]) {
                    $ids[$sigla] = Materia::create([
                        'sigla' => $sigla,
                        'nombre' => $nombre,
                        'semestre' => $semestre,
                        'horas_teoricas' => $ht,
                        'horas_practicas' => $hp,
                        'creditos' => $cr,
                        'orden' => $orden,
                    ])->id;
                }
            }

            foreach (self::OPTATIVAS as $orden => $sigla) {
                $ids[$sigla] = Materia::create([
                    'sigla' => $sigla,
                    'nombre' => 'Materia optativa de graduación',
                    'semestre' => 10,
                    'optativa' => true,
                    'orden' => $orden,
                ])->id;
            }

            foreach (self::MATERIAS as $materias) {
                foreach ($materias as [$sigla, , , , , $requisitos]) {
                    Materia::find($ids[$sigla])->prerrequisitos()->attach(array_map(fn ($r) => $ids[$r], $requisitos));
                }
            }

            // Las optativas piden todas las materias del 9.º semestre
            $noveno = array_map(fn ($m) => $ids[$m[0]], self::MATERIAS[9]);
            foreach (self::OPTATIVAS as $sigla) {
                Materia::find($ids[$sigla])->prerrequisitos()->attach($noveno);
            }
        });
    }
}
