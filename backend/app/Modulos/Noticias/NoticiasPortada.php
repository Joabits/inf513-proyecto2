<?php

namespace App\Modulos\Noticias;

use App\Compartido\Portada\SeccionPortada;
use Illuminate\Support\Facades\Storage;

/** Las últimas noticias publicadas, para la portada (CU-01). */
class NoticiasPortada implements SeccionPortada
{
    /** Una destacada y dos más pequeñas, como en la portada de otros portales universitarios. */
    public const CANTIDAD = 3;

    public function clave(): string
    {
        return 'noticias';
    }

    public function elementos(): array
    {
        return Model::query()
            ->where('publicada', true)
            ->orderByDesc('publicada_en')
            ->orderByDesc('id')
            ->limit(self::CANTIDAD)
            ->get(['id', 'titulo', 'resumen', 'imagen', 'publicada_en', 'created_at'])
            ->map(fn (Model $noticia) => [
                'id' => $noticia->id,
                'titulo' => $noticia->titulo,
                'resumen' => $noticia->resumen,
                'imagen' => $noticia->imagen ? Storage::disk('public')->url($noticia->imagen) : null,
                'fecha' => ($noticia->publicada_en ?? $noticia->created_at)?->toIso8601String(),
                'ruta' => "/noticias/{$noticia->id}",
            ])
            ->all();
    }
}
