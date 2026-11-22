<?php

namespace App\Modulos\Noticias;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * Una noticia como la ve el visitante (CU-01). Sin la cuenta del panel que la cargó: ese nombre no es un autor
 * elegido para el público, es un dato interno. El listado no lleva el texto completo, solo el detalle.
 * Resource, con todo, queda para quien gestiona.
 *
 * @mixin Model
 */
class NoticiaPublicaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'resumen' => $this->resumen,
            // Solo en el detalle (/noticias/{id}): en el listado sería descargar cada texto completo sin mostrarlo
            'contenido' => $this->when($request->route('id') !== null, $this->contenido),
            'imagen' => $this->imagen ? Storage::url($this->imagen) : null,
            'publicada_en' => $this->publicada_en?->format('d/m/Y H:i'),
            'creada_en' => $this->created_at?->format('d/m/Y H:i'),
        ];
    }
}
