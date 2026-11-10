<?php

namespace App\Modulos\Menu;

use App\Models\User;
use Illuminate\Support\Collection;

class MenuService
{
    /**
     * Menú público: lo ve cualquiera.
     * Menú de gestión: solo las opciones cuyo permiso tiene el rol activo (matriz de acceso).
     */
    public function paraUsuario(?User $usuario): array
    {
        $permisos = $usuario?->rol?->permisos()->pluck('permisos.id')->all() ?? [];

        return [
            'publico' => $this->publico(),
            'gestion' => $usuario && $usuario->activo && $permisos ? $this->gestion($permisos) : collect(),
        ];
    }

    private function publico(): Collection
    {
        return Menu::query()
            ->where('seccion', 'publico')->whereNull('parent_id')->where('activo', true)
            ->with('hijos')
            ->orderBy('orden')
            ->get();
    }

    /** Grupos de gestión con solo las opciones permitidas; los grupos vacíos no se muestran. */
    private function gestion(array $permisos): Collection
    {
        $permitidas = fn ($q) => $q->whereIn('permiso_id', $permisos);

        return Menu::query()
            ->where('seccion', 'gestion')->whereNull('parent_id')->where('activo', true)
            ->whereHas('hijos', $permitidas)
            ->with(['hijos' => $permitidas])
            ->orderBy('orden')
            ->get();
    }
}
