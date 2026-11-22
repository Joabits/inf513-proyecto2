<?php

namespace App\Modulos\Documentos;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Un documento como lo ve el visitante: solo lo que muestra la página pública.
 *
 * No incluye quién lo subió ni el nombre con que venía el archivo: son datos internos del panel, y el nombre
 * original es un texto sin revisar («borrador_v3_firmar.pdf») que nadie escribió pensando en el público.
 * DocumentoResource, que sí los lleva, es solo para quien gestiona.
 *
 * @mixin Documento
 */
class DocumentoPublicoResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'descripcion' => $this->descripcion,
            'categoria' => ['id' => $this->categoria->id, 'nombre' => $this->categoria->nombre],
            'tipo' => $this->tipo,
            'tamano' => $this->tamano,
            'creado' => $this->created_at?->toIso8601String(),
        ];
    }
}
