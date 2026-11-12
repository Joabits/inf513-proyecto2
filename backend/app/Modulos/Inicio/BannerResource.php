<?php

namespace App\Modulos\Inicio;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class BannerResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'imagen' => Storage::disk('public')->url($this->imagen),
            'texto_alternativo' => $this->texto_alternativo,
            'enlace' => $this->enlace,
        ];
    }
}
