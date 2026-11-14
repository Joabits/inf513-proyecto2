<?php

namespace App\Modulos\MallaCurricular;

use App\Compartido\Busqueda\FuenteBusqueda;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/** Materias del plan de estudios: se encuentran por nombre o por sigla. */
class FuenteMaterias implements FuenteBusqueda
{
    public function tipo(): string
    {
        return 'materia';
    }

    public function etiqueta(): string
    {
        return 'Materias';
    }

    public function consulta(): Builder
    {
        return Materia::query();
    }

    public function columnas(): array
    {
        return ['nombre', 'sigla'];
    }

    public function orden(): array
    {
        return [['semestre', 'asc'], ['orden', 'asc']];
    }

    public function resultado(Model $fila, array $terminos): array
    {
        return [
            'titulo' => $fila->nombre,
            'resumen' => null,
            'meta' => "{$fila->sigla} · {$fila->semestre}.º semestre",
            'ruta' => '/malla-curricular',
            'externo' => false,
        ];
    }
}
