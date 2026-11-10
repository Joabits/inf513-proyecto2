<?php

namespace App\Modulos\Inicio;

use Illuminate\Http\Resources\Json\JsonResource;

class AccesoResource extends JsonResource
{
    public function toArray($request): array
    {
        return ['titulo' => $this->titulo, 'descripcion' => $this->descripcion, 'ruta' => $this->ruta];
    }
}
