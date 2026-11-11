<?php

namespace App\Modulos\Documentos;

use Illuminate\Http\Resources\Json\JsonResource;

class CategoriaResource extends JsonResource
{
    public function toArray($request): array
    {
        return ['id' => $this->id, 'nombre' => $this->nombre];
    }
}
