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
            'categoria' => ['id' => $this->categoria->id, 'nombre' => $this->categoria->nombre],
            'tipo' => $this->tipo,
            'mime' => $this->mime,
            'tamano' => $this->tamano,
            'nombre_original' => $this->nombre_original,
            'publicado' => $this->publicado,
            'subido_por' => $this->autor?->name,
            'versiones' => $this->whenCounted('versiones'),
            'creado' => $this->created_at?->toIso8601String(),
            'actualizado' => $this->updated_at?->toIso8601String(),
        ];
    }
}
