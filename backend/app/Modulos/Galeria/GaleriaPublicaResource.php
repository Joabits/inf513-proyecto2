<?php

namespace App\Modulos\Galeria;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * Una foto de la galería como la ve el visitante (CU-06). Sin la cuenta del panel que la subió
 * («Publicado por»): es un dato interno. Resource queda para quien gestiona.
 *
 * @mixin Model
 */
class GaleriaPublicaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $imagen = null;
        if ($this->imagen) {
            $imagen = str_starts_with($this->imagen, 'http://') || str_starts_with($this->imagen, 'https://')
                ? $this->imagen
                : Storage::url($this->imagen);
        }

        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'descripcion' => $this->descripcion,
            'imagen' => $imagen,
            'creado_en' => $this->created_at?->format('d/m/Y'),
        ];
    }
}
