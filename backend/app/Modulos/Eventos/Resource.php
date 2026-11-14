<?php

namespace App\Modulos\Eventos;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class Resource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'descripcion' => $this->descripcion,
            'fecha_inicio' => $this->fecha_inicio?->format('d/m/Y H:i'),
            'fecha_fin' => $this->fecha_fin?->format('d/m/Y H:i'),
            'fecha_inicio_iso' => $this->fecha_inicio?->format('Y-m-d\TH:i'),
            'fecha_fin_iso' => $this->fecha_fin?->format('Y-m-d\TH:i'),
            'lugar' => $this->lugar,
            'enlace' => $this->enlace,
            'publicado' => (bool) $this->publicado,
            'autor' => $this->autor?->name ?? 'Desconocido',
        ];
    }
}
