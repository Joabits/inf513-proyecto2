<?php

namespace App\Modulos\Vinculacion;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class Resource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'descripcion' => $this->descripcion,
            'enlace' => $this->enlace,
            'imagen' => $this->imagen ? Storage::url($this->imagen) : null,
            'publicado' => (bool) $this->publicado,
            'autor' => $this->autor?->name,
            'creado_en' => $this->created_at?->format('d/m/Y H:i'),
        ];
    }
}

if (! class_exists('App\Modulos\Vinculacion\VinculacionResource', false)) {
    class_alias(Resource::class, 'App\Modulos\Vinculacion\VinculacionResource');
}
