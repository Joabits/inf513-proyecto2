<?php

namespace App\Modulos\Revista;

use App\Compartido\Busqueda\FuenteBusqueda;
use App\Compartido\Busqueda\Texto;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/** Ediciones publicadas de la revista INNOVAR: el resultado lleva a la edición en la página pública. */
class FuenteEdiciones implements FuenteBusqueda
{
    public function tipo(): string
    {
        return 'edicion';
    }

    public function etiqueta(): string
    {
        return 'Ediciones de INNOVAR';
    }

    public function consulta(): Builder
    {
        return Edicion::query()->where('publicada', true);
    }

    public function columnas(): array
    {
        return ['titulo', 'descripcion'];
    }

    public function orden(): array
    {
        return [['anio', 'desc'], ['numero', 'desc'], ['id', 'desc']];
    }

    public function resultado(Model $fila, array $terminos): array
    {
        /** @var Edicion $fila */
        return [
            'titulo' => $fila->titulo ?: $fila->nombre(),
            'resumen' => Texto::fragmento($fila->descripcion, $terminos),
            'meta' => 'Revista INNOVAR · '.$fila->nombre(),
            'ruta' => "/revista-innovar#edicion-{$fila->id}",
            'externo' => false,
        ];
    }
}
