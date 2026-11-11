<?php

namespace App\Modulos\Investigacion;

use Illuminate\Http\Resources\Json\JsonResource;

class LineaResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'descripcion' => $this->descripcion,
            'proyectos' => $this->whenCounted('proyectos'),
        ];
    }
}
