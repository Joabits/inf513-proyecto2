<?php

namespace App\Modulos\Inicio;

use Illuminate\Http\Resources\Json\JsonResource;

class CifraResource extends JsonResource
{
    public function toArray($request): array
    {
        return ['valor' => $this->valor, 'etiqueta' => $this->etiqueta];
    }
}
