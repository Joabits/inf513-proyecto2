<?php

namespace App\Modulos\Docentes;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class PersonaResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'cargo' => $this->cargo,
            'grupo' => $this->grupo,
            'foto' => $this->foto ? Storage::disk('public')->url($this->foto) : null,
            'visible' => $this->visible,
        ];
    }
}
