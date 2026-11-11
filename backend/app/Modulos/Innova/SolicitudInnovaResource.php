<?php

namespace App\Modulos\Innova;

use Illuminate\Http\Resources\Json\JsonResource;

class SolicitudInnovaResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'organizacion' => $this->organizacion,
            'correo' => $this->correo,
            'telefono' => $this->telefono,
            'servicio' => $this->servicio,
            'descripcion' => $this->descripcion,
            'estado' => $this->estado,
            'respuesta' => $this->respuesta,
            'atendida_por' => $this->atendente?->name,
            'atendida_en' => $this->atendida_en?->toIso8601String(),
            'recibida' => $this->created_at?->toIso8601String(),
        ];
    }
}
