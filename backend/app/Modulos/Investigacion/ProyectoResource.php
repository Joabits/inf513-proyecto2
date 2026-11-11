<?php

namespace App\Modulos\Investigacion;

use Illuminate\Http\Resources\Json\JsonResource;

class ProyectoResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'tipo' => $this->tipo,
            'linea' => $this->linea ? ['id' => $this->linea->id, 'nombre' => $this->linea->nombre] : null,
            'responsable' => $this->responsable,
            'integrantes' => $this->integrantes,
            'gestion' => $this->gestion,
            'estado' => $this->estado,
            'resumen' => $this->resumen,
            'publicado' => $this->publicado,
            // Solo para el panel: quién lo registró o editó por última vez
            'editado_por' => $this->whenLoaded('autor', fn () => $this->autor?->name),
            'actualizado' => $this->updated_at?->toIso8601String(),
        ];
    }
}
