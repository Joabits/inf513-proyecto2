<?php

namespace App\Modulos\Investigacion;

use App\Compartido\Busqueda\FuenteBusqueda;
use App\Compartido\Busqueda\Texto;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/** Semilleros de investigación. */
class FuenteSemilleros implements FuenteBusqueda
{
    public function tipo(): string
    {
        return 'semillero';
    }

    public function etiqueta(): string
    {
        return 'Semilleros';
    }

    public function consulta(): Builder
    {
        return Semillero::query();
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
            'ruta' => '/investigacion#semilleros',
            'externo' => false,
        ];
    }
}
