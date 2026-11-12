<?php

namespace App\Modulos\Usuarios;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

class UsuarioResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->name,
            'email' => $this->email,
            'rol' => $this->rol ? ['id' => $this->rol->id, 'slug' => $this->rol->slug, 'nombre' => $this->rol->nombre] : null,
            'activo' => $this->activo,
            // Solo viene en el listado (subconsulta a la bitácora)
            'ultimo_ingreso' => $this->ultimo_ingreso ? Carbon::parse($this->ultimo_ingreso)->toIso8601String() : null,
            'creado' => $this->created_at?->toIso8601String(),
            // El panel oculta las acciones que nadie puede hacer sobre su propia cuenta
            'es_usted' => $request->user()?->is($this->resource) ?? false,
        ];
    }
}
