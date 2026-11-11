<?php

namespace App\Modulos\Documentos;

use Illuminate\Http\Resources\Json\JsonResource;

class DocumentoResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'descripcion' => $this->descripcion,
            'categoria' => $this->categoria,
            'tipo' => $this->tipo,
            'tamano' => $this->tamano,
            'nombre_original' => $this->nombre_original,
            'publicado' => $this->publicado,
            'versiones' => $this->whenCounted('versiones'),
            'actualizado' => $this->updated_at?->toIso8601String(),
        ];
    }
}
