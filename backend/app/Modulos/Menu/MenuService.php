<?php

namespace App\Modulos\Menu;

use App\Models\User;
use Illuminate\Support\Collection;

class MenuService
{
    /**
     * Menú público: lo ve cualquiera.
     * Menú de gestión: solo las opciones que la matriz rol_menu asigna al rol del usuario.
     */
    public function paraUsuario(?User $usuario): array
    {
        return [
            'publico' => $this->arbol('publico', null),
            'gestion' => $usuario?->rol_id ? $this->arbol('gestion', $usuario->rol_id) : [],
        ];
    }

    private function arbol(string $seccion, ?int $rolId): Collection
    {
        $filtroRol = fn ($q) => $q->where('rol_id', $rolId);

        return Menu::query()
            ->where('seccion', $seccion)
            ->whereNull('parent_id')
            ->where('activo', true)
            ->when($rolId, fn ($q) => $q->where(fn ($q) => $q
                ->whereHas('roles', $filtroRol)
                ->orWhereHas('hijos.roles', $filtroRol)))
            ->with(['hijos' => fn ($q) => $q->when($rolId, fn ($q) => $q->whereHas('roles', $filtroRol))])
            ->orderBy('orden')
            ->get();
    }
}
