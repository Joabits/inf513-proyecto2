<?php

namespace App\Modulos\Autenticacion;

use App\Compartido\Servicios\Bitacora;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class AutenticacionService
{
    /** Intentos permitidos por minuto para cada combinación de correo e IP. */
    private const MAX_INTENTOS = 5;

    public function __construct(private Bitacora $bitacora) {}

    /**
     * Inicia la sesión solo si la cuenta está activa. El mensaje de error es el mismo
     * en todos los casos, para no revelar qué correos están registrados.
     */
    public function iniciarSesion(string $correo, string $clave, ?string $ip): void
    {
        $llave = 'login:'.$correo.'|'.$ip;

        // Se cuenta antes de comprobar la clave: así las peticiones simultáneas no evaden el límite
        if (RateLimiter::increment($llave) > self::MAX_INTENTOS) {
            throw ValidationException::withMessages([
                'email' => __('auth.throttle', ['seconds' => RateLimiter::availableIn($llave)]),
            ])->status(429);
        }

        $sesion = Auth::guard('web');

        if (! $sesion->attempt(['email' => $correo, 'password' => $clave, 'activo' => true])) {
            $this->bitacora->ingresoFallido($correo);

            throw ValidationException::withMessages(['email' => __('auth.failed')]);
        }

        RateLimiter::clear($llave);
        $this->bitacora->ingreso($sesion->user());
    }

    public function cerrarSesion(User $usuario): void
    {
        Auth::guard('web')->logout();

        $this->bitacora->salida($usuario);
    }
}
