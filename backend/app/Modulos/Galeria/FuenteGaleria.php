<?php

namespace App\Modulos\Galeria;

use App\Compartido\Busqueda\FuenteBusqueda;
use App\Compartido\Busqueda\Texto;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model as Fila;

/** Fotos publicadas de la galería, por título o descripción. El resultado lleva a /galeria: las fotos no tienen página propia. */
class FuenteGaleria implements FuenteBusqueda
{
    public function tipo(): string
    {
        return 'foto';
    }

    public function etiqueta(): string
    {
        return 'Galería multimedia';
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
            'titulo' => $fila->titulo ?: 'Foto sin título',
            'resumen' => Texto::fragmento($fila->descripcion, $terminos),
            'meta' => 'Galería multimedia · '.$fila->created_at->locale('es')->isoFormat('D MMM YYYY'),
            'ruta' => '/galeria',
            'externo' => false,
        ];
    }
}
