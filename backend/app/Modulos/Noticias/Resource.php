<?php

namespace App\Modulos\Noticias;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class Resource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'resumen' => $this->resumen,
            'contenido' => $this->contenido,
            'imagen' => $this->imagen ? Storage::url($this->imagen) : null,
            'publicada' => (bool) $this->publicada,
            'publicada_en' => $this->publicada_en ? $this->publicada_en->format('d/m/Y H:i') : null,
            'autor' => $this->autor?->name ?? 'Anónimo',
            'creada_en' => $this->created_at ? $this->created_at->format('d/m/Y H:i') : null,
        ];
    }
}
