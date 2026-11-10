<?php

namespace App\Compartido\Servicios;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * Registro único de la bitácora. Todos los módulos la usan así:
 *   app(Bitacora::class)->accion($usuario, 'crear', $noticia);
 */
class Bitacora
{
    public function accion(User $usuario, string $accion, Model|string $recurso, ?string $detalle = null): void
    {
        $nombre = $recurso instanceof Model
            ? class_basename($recurso).' #'.$recurso->getKey()
            : $recurso;

        $this->guardar('accion', $usuario->id, $accion, $nombre, $detalle);
    }

    public function ingreso(User $usuario): void
    {
        $this->guardar('ingreso_ok', $usuario->id);
    }

    public function ingresoFallido(string $correo): void
    {
        $this->guardar('ingreso_fallido', null, null, null, 'Correo: '.$correo);
    }

    public function salida(User $usuario): void
    {
        $this->guardar('salida', $usuario->id);
    }

    private function guardar(string $tipo, ?int $userId, ?string $accion = null, ?string $recurso = null, ?string $detalle = null): void
    {
        DB::table('bitacora')->insert([
            'user_id' => $userId,
            'tipo' => $tipo,
            'accion' => $accion,
            'recurso' => $recurso,
            'detalle' => $detalle,
            'ip' => request()->ip(),
            'navegador' => substr((string) request()->userAgent(), 0, 255),
            'created_at' => now(),
        ]);
    }
}
