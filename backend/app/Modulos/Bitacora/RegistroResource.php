<?php

namespace App\Modulos\Bitacora;

use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Registro */
class RegistroResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'fecha' => $this->created_at?->toIso8601String(),
            'tipo' => $this->tipo,
            'accion' => $this->accion,
            'recurso' => $this->recurso,
            'detalle' => $this->detalle,
            'cambios' => $this->cambios,
            // El correo guardado identifica al autor aunque su cuenta ya no exista
            'usuario' => $this->usuario,
            'nombre' => $this->nombre_usuario,
            'cuenta_eliminada' => $this->usuario !== null && $this->user_id === null,
            'ip' => $this->ip,
            'navegador' => $this->navegador,
            'codigo_http' => $this->tipo === 'acceso' && preg_match('/^HTTP (\d{3})$/', (string) $this->detalle, $m) ? (int) $m[1] : null,
            // Lo que merece atención al revisar, y a qué sección del panel apuntaba un acceso
            'importante' => BitacoraService::esImportante($this->resource),
            'seccion' => $this->tipo === 'acceso' ? BitacoraService::seccionDe($this->recurso) : null,
        ];
    }
}
