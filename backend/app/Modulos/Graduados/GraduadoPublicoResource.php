<?php

namespace App\Modulos\Graduados;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Un graduado como lo ve el visitante en el Directorio de Graduados (/alumni). Solo datos académicos:
 * sin carnet, correo ni teléfono, y sin la cuenta del panel que lo registró. Resource queda para
 * quien gestiona los graduados (CU-10 y CU-18), detrás de la sesión y el permiso graduados.ver.
 *
 * @mixin Model
 */
class GraduadoPublicoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nombre_completo' => $this->nombre_completo,
            'gestion_ingreso' => $this->gestion_ingreso,
            'gestion_egreso' => $this->gestion_egreso,
            'modalidad' => $this->modalidad,
            'titulo_tema' => $this->titulo_tema,
        ];
    }
}
