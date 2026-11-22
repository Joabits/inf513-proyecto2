<?php

namespace App\Modulos\Eventos;

use App\Compartido\Busqueda\FuenteBusqueda;
use App\Compartido\Busqueda\Texto;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model as Fila;

/** Eventos publicados, como los lista /eventos. El resultado lleva a esa lista: los eventos no tienen página propia. */
class FuenteEventos implements FuenteBusqueda
{
    public function tipo(): string
    {
        return 'evento';
    }

    public function etiqueta(): string
    {
        return 'Eventos académicos';
    }

    public function consulta(): Builder
    {
        return Model::query()->where('publicado', true);
    }

    public function columnas(): array
    {
        return ['titulo', 'descripcion', 'lugar'];
    }

    public function orden(): array
    {
        return [['fecha_inicio', 'desc'], ['id', 'desc']];
    }

    public function resultado(Fila $fila, array $terminos): array
    {
        /** @var Model $fila */
        return [
            'titulo' => $fila->titulo,
            'resumen' => Texto::fragmento($fila->descripcion, $terminos),
            'meta' => implode(' · ', array_filter([
                $fila->fecha_inicio?->locale('es')->isoFormat('D MMM YYYY'),
                $fila->lugar,
            ])),
            'ruta' => '/eventos',
            'externo' => false,
        ];
    }
}
