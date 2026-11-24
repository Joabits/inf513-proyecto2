<?php

namespace App\Modulos\Galeria;

use App\Compartido\Portada\SeccionPortada;
use Illuminate\Support\Facades\Storage;

/**
 * Las fotos más recientes de la galería, para el mosaico «Vida en la Carrera» de la portada (CU-01).
 * Son cinco: una grande y cuatro chicas llenan el mosaico justo, en PC (4 columnas) y en el celular (2).
 */
class GaleriaPortada implements SeccionPortada
{
    public const CANTIDAD = 5;

    public function clave(): string
    {
        return 'galeria';
    }

    public function elementos(): array
    {
        return Model::query()
            ->where('publicado', true)
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->limit(self::CANTIDAD)
            ->get(['id', 'titulo', 'imagen'])
            ->map(fn (Model $foto) => [
                'id' => $foto->id,
                'titulo' => $foto->titulo,
                // Igual que GaleriaPublicaResource: una foto puede venir de una dirección externa
                'imagen' => str_starts_with($foto->imagen, 'http://') || str_starts_with($foto->imagen, 'https://')
                    ? $foto->imagen
                    : Storage::disk('public')->url($foto->imagen),
            ])
            ->all();
    }
}
