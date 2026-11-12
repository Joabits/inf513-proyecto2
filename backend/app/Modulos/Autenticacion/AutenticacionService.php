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

    /**
     * Intentos por minuto desde una misma IP sumando todos los correos: frena a quien prueba
     * muchas cuentas distintas (el límite anterior solo cuenta los intentos de cada correo).
     */
    private const MAX_INTENTOS_POR_IP = 20;

    public function __construct(private Bitacora $bitacora) {}

    /**
     * Inicia la sesión solo si la cuenta está activa. El mensaje de error es el mismo
     * en todos los casos, para no revelar qué correos están registrados.
     */
    public function iniciarSesion(string $correo, string $clave, ?string $ip): void
    {
        $llave = 'login:'.$correo.'|'.$ip;
        $llaveIp = 'login-ip:'.$ip;

        // Se cuenta antes de comprobar la clave: así las peticiones simultáneas no evaden el límite
        $intentosCorreo = RateLimiter::increment($llave);
        $intentosIp = RateLimiter::increment($llaveIp);

        if ($intentosCorreo > self::MAX_INTENTOS || $intentosIp > self::MAX_INTENTOS_POR_IP) {
            $espera = max(RateLimiter::availableIn($llave), RateLimiter::availableIn($llaveIp));

            throw ValidationException::withMessages([
                'email' => __('auth.throttle', ['seconds' => $espera]),
            ])->status(429);
        }

        $sesion = Auth::guard('web');

        if (! $sesion->attempt(['email' => $correo, 'password' => $clave, 'activo' => true])) {
            $this->bitacora->ingresoFallido($correo);

            throw ValidationException::withMessages(['email' => __('auth.failed')]);
        }

        // Solo se reinicia el contador del correo: el de la IP sigue contando aunque se acierte
        RateLimiter::clear($llave);
        $this->bitacora->ingreso($sesion->user());
    }

    public function cerrarSesion(User $usuario): void
    {
        Auth::guard('web')->logout();

        $this->bitacora->salida($usuario);
    }
}
