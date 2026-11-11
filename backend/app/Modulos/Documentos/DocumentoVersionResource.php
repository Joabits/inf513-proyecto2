<?php

namespace App\Modulos\Documentos;

use Illuminate\Http\Resources\Json\JsonResource;

class DocumentoVersionResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'tipo' => $this->tipo,
            'tamano' => $this->tamano,
            'nombre_original' => $this->nombre_original,
            'subido_por' => $this->autor?->name,
            'reemplazado' => $this->created_at?->toIso8601String(),
        ];
    }
}
