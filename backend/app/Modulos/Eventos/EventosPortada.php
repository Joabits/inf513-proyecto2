<?php

namespace App\Modulos\Eventos;

use App\Compartido\Portada\SeccionPortada;

/**
 * Los próximos eventos publicados, para la portada (CU-01). Un evento sigue en la lista mientras no termine,
 * así uno de varios días se ve hasta su último día; los que ya pasaron no se muestran.
 */
class EventosPortada implements SeccionPortada
{
    public const CANTIDAD = 3;

    public function clave(): string
    {
        return 'eventos';
    }

    public function elementos(): array
    {
        return Model::query()
            ->where('publicado', true)
            ->where('fecha_fin', '>=', now())
            ->orderBy('fecha_inicio')
            ->orderBy('id')
            ->limit(self::CANTIDAD)
            ->get(['id', 'titulo', 'lugar', 'fecha_inicio', 'fecha_fin'])
            ->map(fn (Model $evento) => [
                'id' => $evento->id,
                'titulo' => $evento->titulo,
                'lugar' => $evento->lugar,
                'inicio' => $evento->fecha_inicio?->toIso8601String(),
                'fin' => $evento->fecha_fin?->toIso8601String(),
                'ruta' => '/eventos',
            ])
            ->all();
    }
}
