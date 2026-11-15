<?php

namespace App\Modulos\Galeria;

use Illuminate\Http\Request as HttpRequest;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class Resource extends JsonResource
{
    public function toArray(HttpRequest $request): array
    {
        $urlImagen = null;
        if ($this->imagen) {
            $urlImagen = str_starts_with($this->imagen, 'http://') || str_starts_with($this->imagen, 'https://')
                ? $this->imagen
                : Storage::url($this->imagen);
        }

        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'descripcion' => $this->descripcion,
            'imagen' => $urlImagen,
            'publicado' => (bool) $this->publicado,
            'autor' => $this->autor?->name,
            'creado_en' => $this->created_at?->format('d/m/Y'),
        ];
    }
}
