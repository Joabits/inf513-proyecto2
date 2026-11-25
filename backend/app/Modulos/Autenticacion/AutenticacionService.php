<?php

namespace App\Modulos\Autenticacion;

use App\Compartido\Servicios\Bitacora;
use App\Models\Rol;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
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
     * Inicia la sesión solo si la cuenta está activa. El mensaje de error es el mismo en todos los casos, para no
     * revelar qué correos están registrados ni qué cuentas están desactivadas. La única excepción es el graduado que
     * solicitó su cuenta y todavía no la aprobaron: con su contraseña correcta se le dice que espera la aprobación.
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

            if ($this->solicitudPendiente($correo, $clave)) {
                throw ValidationException::withMessages(['email' => 'Su solicitud de cuenta todavía no fue aprobada. La Carrera revisará sus datos y activará su cuenta; si ya pasó un tiempo, consulte en la Dirección de Carrera.']);
            }

            throw ValidationException::withMessages(['email' => __('auth.failed')]);
        }

        // Solo se reinicia el contador del correo: el de la IP sigue contando aunque se acierte
        RateLimiter::clear($llave);
        $this->bitacora->ingreso($sesion->user());
    }

    /**
     * CU-10: una cuenta de graduado (rol Usuario) inactiva que nunca ingresó es una solicitud que espera aprobación.
     * Una cuenta que ya ingresó alguna vez y está inactiva fue desactivada: recibe el mensaje de siempre.
     */
    private function solicitudPendiente(string $correo, string $clave): bool
    {
        $cuenta = User::with('rol')->where('email', $correo)->first();

        return $cuenta && ! $cuenta->activo && $cuenta->rol?->slug === Rol::USUARIO
            && Hash::check($clave, $cuenta->password)
            && ! DB::table('bitacora')->where('user_id', $cuenta->id)->where('tipo', 'ingreso_ok')->exists();
    }

    public function cerrarSesion(User $usuario): void
    {
        Auth::guard('web')->logout();

        $this->bitacora->salida($usuario);
    }
}
