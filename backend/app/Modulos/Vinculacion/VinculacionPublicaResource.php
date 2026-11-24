<?php

namespace App\Modulos\Vinculacion;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * Un convenio o vinculación como lo ve el visitante (CU-20). Sin la cuenta del panel que lo cargó ni su estado:
 * igual que en noticias y eventos. Resource queda para quien gestiona.
 *
 * @mixin Model
 */
class VinculacionPublicaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'descripcion' => $this->descripcion,
            'enlace' => $this->enlace,
            'imagen' => $this->imagen ? Storage::url($this->imagen) : null,
            'creado_en' => $this->created_at?->format('d/m/Y'),
        ];
    }
}
