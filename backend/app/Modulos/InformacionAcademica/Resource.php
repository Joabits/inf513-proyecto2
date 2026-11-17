<?php

namespace App\Modulos\InformacionAcademica;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class Resource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'mision' => $this->mision,
            'vision' => $this->vision,
            'perfil_profesional' => $this->perfil_profesional,
            'objetivos' => $this->objetivos,
            'autor' => $this->autor?->name,
            'actualizado_en' => $this->updated_at?->format('d/m/Y H:i'),
        ];
    }
}
