<?php

namespace App\Modulos\MallaCurricular;

/** CU-02 Consultar malla curricular: el plan vigente organizado por semestre. */
class MallaService
{
    public function malla(): array
    {
        $materias = Materia::with('prerrequisitos:id,sigla')->orderBy('semestre')->orderBy('orden')->get();

        // Para cada materia, las que habilita: las que la tienen como prerrequisito
        $habilita = [];
        foreach ($materias as $materia) {
            foreach ($materia->prerrequisitos as $requisito) {
                $habilita[$requisito->sigla][] = $materia->sigla;
            }
        }

        $semestres = $materias->groupBy('semestre')->map(fn ($delSemestre, $numero) => [
            'numero' => $numero,
            'materias' => $delSemestre->map(fn (Materia $m) => [
                'sigla' => $m->sigla,
                'nombre' => $m->nombre,
                'horas_teoricas' => $m->horas_teoricas,
                'horas_practicas' => $m->horas_practicas,
                'creditos' => $m->creditos,
                'optativa' => $m->optativa,
                'prerrequisitos' => $m->prerrequisitos->pluck('sigla')->values()->all(),
                'habilita' => $habilita[$m->sigla] ?? [],
            ])->values()->all(),
            'totales' => [
                'horas_teoricas' => $delSemestre->where('optativa', false)->sum('horas_teoricas'),
                'horas_practicas' => $delSemestre->where('optativa', false)->sum('horas_practicas'),
                'creditos' => $delSemestre->where('optativa', false)->sum('creditos'),
            ],
        ])->values()->all();

        // Las optativas de graduación cuentan como una sola materia: el estudiante elige una
        $obligatorias = $materias->where('optativa', false)->count();
        $totalMaterias = $obligatorias + ($materias->contains('optativa', true) ? 1 : 0);

        $plan = PlanEstudios::first();

        return [
            'plan' => $plan ? [
                'codigo' => $plan->codigo,
                'nivel' => $plan->nivel,
                'sistema' => $plan->sistema,
                'semestres' => $plan->semestres,
                'titulaciones' => $plan->titulaciones,
                'nota_graduacion' => $plan->nota_graduacion,
                'total_materias' => $totalMaterias,
                'total_creditos' => $materias->where('optativa', false)->sum('creditos'),
            ] : null,
            'semestres' => $semestres,
        ];
    }
}
