<?php

namespace App\Modulos\Autenticacion;

use App\Compartido\Servicios\Bitacora;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AutenticacionService
{
    public function __construct(private Bitacora $bitacora) {}

    /**
     * Inicia la sesión solo si la cuenta está activa. El mensaje de error es el mismo
     * en todos los casos, para no revelar qué correos están registrados.
     */
    public function iniciarSesion(string $correo, string $clave): void
    {
        $sesion = Auth::guard('web');

        if (! $sesion->attempt(['email' => $correo, 'password' => $clave, 'activo' => true])) {
            $this->bitacora->ingresoFallido($correo);

            throw ValidationException::withMessages(['email' => __('auth.failed')]);
        }

        $this->bitacora->ingreso($sesion->user());
    }

    public function cerrarSesion(User $usuario): void
    {
        Auth::guard('web')->logout();

        $this->bitacora->salida($usuario);
    }
}
