<?php

namespace App\Modulos\Eventos;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Un evento como lo ve el visitante (CU-01). Sin la cuenta del panel que lo cargó: quien escribe el evento
 * no es quien lo organiza, y mostrarlo como «Organizado por» era falso. Resource queda para quien gestiona.
 *
 * @mixin Model
 */
class EventoPublicoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'descripcion' => $this->descripcion,
            'fecha_inicio' => $this->fecha_inicio?->format('d/m/Y H:i'),
            'fecha_fin' => $this->fecha_fin?->format('d/m/Y H:i'),
            'fecha_inicio_iso' => $this->fecha_inicio?->format('Y-m-d\TH:i'),
            'fecha_fin_iso' => $this->fecha_fin?->format('Y-m-d\TH:i'),
            'lugar' => $this->lugar,
            'enlace' => $this->enlace,
        ];
    }
}
