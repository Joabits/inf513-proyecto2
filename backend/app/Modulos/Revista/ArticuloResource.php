<?php

namespace App\Modulos\Revista;

use Illuminate\Http\Resources\Json\JsonResource;

class ArticuloResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'autores' => $this->autores,
            'resumen' => $this->resumen,
            // El PDF no se expone por su ruta: se descarga por la API
            'archivo' => $this->archivo ? ['nombre' => $this->archivo_nombre, 'tamano' => $this->archivo_tamano] : null,
        ];
    }
}
