<?php

namespace App\Modulos\Docentes;

use App\Compartido\Busqueda\FuenteBusqueda;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * Autoridades, personal administrativo y docentes visibles en /docentes. Solo nombre y cargo:
 * las personas ocultas (por ejemplo, autoridades universitarias que aún no se publican) no aparecen.
 */
class FuentePersonal implements FuenteBusqueda
{
    public function tipo(): string
    {
        return 'persona';
    }

    public function etiqueta(): string
    {
        return 'Autoridades y docentes';
    }

    public function consulta(): Builder
    {
        return Persona::query()->where('visible', true);
    }

    public function columnas(): array
    {
        return ['nombre', 'cargo'];
    }

    public function orden(): array
    {
        return [['orden', 'asc'], ['id', 'asc']];
    }

    public function resultado(Model $fila, array $terminos): array
    {
        return [
            'titulo' => $fila->nombre,
            'resumen' => $fila->cargo,
            'meta' => Persona::GRUPOS[$fila->grupo] ?? null,
            // Lleva a la sección de su grupo en la página pública
            'ruta' => "/docentes#titulo-{$fila->grupo}",
            'externo' => false,
        ];
    }
}
