<?php

namespace App\Modulos\Menu;

use Illuminate\Http\Resources\Json\JsonResource;

class MenuResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'ruta' => $this->ruta,
            'hijos' => $this->relationLoaded('hijos') ? MenuResource::collection($this->hijos) : [],
        ];
    }
}
