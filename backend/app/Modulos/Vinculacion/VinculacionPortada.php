<?php

namespace App\Modulos\Vinculacion;

use App\Compartido\Portada\SeccionPortada;
use Illuminate\Support\Facades\Storage;

/**
 * Logos de los convenios publicados, para la franja «Nuestras alianzas» de la portada (CU-01).
 * Es una franja de logos: los convenios sin imagen no aparecen (siguen en la página de vinculación).
 */
class VinculacionPortada implements SeccionPortada
{
    public const CANTIDAD = 8;

    public function clave(): string
    {
        return 'alianzas';
    }

    public function elementos(): array
    {
        return Model::query()
            ->where('publicado', true)
            ->whereNotNull('imagen')
            ->orderBy('id')
            ->limit(self::CANTIDAD)
            ->get(['id', 'titulo', 'imagen'])
            ->map(fn (Model $convenio) => [
                'id' => $convenio->id,
                'titulo' => $convenio->titulo,
                'imagen' => Storage::disk('public')->url($convenio->imagen),
            ])
            ->all();
    }
}
