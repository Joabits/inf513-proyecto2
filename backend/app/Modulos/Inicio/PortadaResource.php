<?php

namespace App\Modulos\Inicio;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class PortadaResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'distintivo' => $this->distintivo,
            'titulo' => $this->titulo,
            'presentacion' => $this->presentacion,
            'director_nombre' => $this->director_nombre,
            'director_cargo' => $this->director_cargo,
            'director_mensaje' => $this->director_mensaje,
            'director_foto' => $this->director_foto ? Storage::disk('public')->url($this->director_foto) : null,
        ];
    }
}
