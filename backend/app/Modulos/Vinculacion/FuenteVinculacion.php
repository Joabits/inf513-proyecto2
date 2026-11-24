<?php

namespace App\Modulos\Vinculacion;

use App\Compartido\Busqueda\FuenteBusqueda;
use App\Compartido\Busqueda\Texto;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model as Fila;

/** Convenios y vinculaciones publicados (CU-20): el resultado abre la página de vinculación. */
class FuenteVinculacion implements FuenteBusqueda
{
    public function tipo(): string
    {
        return 'vinculacion';
    }

    public function etiqueta(): string
    {
        return 'Convenios y vinculación';
    }

    public function consulta(): Builder
    {
        return Model::query()->where('publicado', true);
    }

    public function columnas(): array
    {
        return ['titulo', 'descripcion'];
    }

    public function orden(): array
    {
        return [['created_at', 'desc'], ['id', 'desc']];
    }

    public function resultado(Fila $fila, array $terminos): array
    {
        /** @var Model $fila */
        return [
            'titulo' => $fila->titulo,
            'resumen' => Texto::fragmento($fila->descripcion, $terminos) ?? $fila->descripcion,
            'meta' => 'Convenio y vinculación',
            'ruta' => '/vinculacion',
            'externo' => false,
        ];
    }
}
