<?php

namespace App\Modulos\Investigacion;

use App\Compartido\Busqueda\FuenteBusqueda;
use App\Compartido\Busqueda\Texto;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/** Líneas de investigación: el resultado muestra los proyectos de esa línea. */
class FuenteLineas implements FuenteBusqueda
{
    public function tipo(): string
    {
        return 'linea';
    }

    public function etiqueta(): string
    {
        return 'Líneas de investigación';
    }

    public function consulta(): Builder
    {
        return Linea::query();
    }

    public function columnas(): array
    {
        return ['nombre', 'descripcion'];
    }

    public function orden(): array
    {
        return [['orden', 'asc']];
    }

    public function resultado(Model $fila, array $terminos): array
    {
        return [
            'titulo' => $fila->nombre,
            'resumen' => Texto::fragmento($fila->descripcion, $terminos),
            'meta' => null,
            'ruta' => "/investigacion?linea={$fila->id}#proyectos",
            'externo' => false,
        ];
    }
}
