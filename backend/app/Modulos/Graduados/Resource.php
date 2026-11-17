<?php

namespace App\Modulos\Graduados;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class Resource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nombre_completo' => $this->nombre_completo,
            'ci' => $this->ci,
            'correo' => $this->correo,
            'telefono' => $this->telefono,
            'gestion_ingreso' => $this->gestion_ingreso,
            'gestion_egreso' => $this->gestion_egreso,
            'modalidad' => $this->modalidad,
            'titulo_tema' => $this->titulo_tema,
            'user_id' => $this->user_id,
            'autor' => $this->autor ? [
                'id' => $this->autor->id,
                'name' => $this->autor->name,
                'email' => $this->autor->email,
            ] : null,
            'creado' => $this->created_at?->toIso8601String(),
            'actualizado' => $this->updated_at?->toIso8601String(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
