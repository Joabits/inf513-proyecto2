<?php

namespace App\Modulos\Revista;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class EdicionResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'volumen' => $this->volumen,
            'numero' => $this->numero,
            'anio' => $this->anio,
            'titulo' => $this->titulo,
            'descripcion' => $this->descripcion,
            'nombre' => $this->nombre(),
            'portada' => $this->portada ? Storage::disk('public')->url($this->portada) : null,
            'archivo' => $this->archivo ? ['nombre' => $this->archivo_nombre, 'tamano' => $this->archivo_tamano] : null,
            'publicada' => $this->publicada,
            'articulos' => ArticuloResource::collection($this->whenLoaded('articulos')),
        ];
    }
}
