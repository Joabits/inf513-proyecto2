<?php

namespace App\Modulos\Contacto;

use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class ContactoService
{
    /** Mensajes que una misma conexión puede enviar en el lapso de abajo. */
    private const MAX_MENSAJES = 5;

    private const LAPSO_SEGUNDOS = 600;

    /**
     * Guarda el mensaje para que lo atienda el personal (CU-25).
     * Si viene de un programa automático, responde igual que si lo hubiera guardado,
     * para no darle pistas, pero no lo guarda.
     */
    public function enviar(array $datos, bool $automatico, ?string $ip, ?string $navegador): void
    {
        $llave = 'contacto:'.$ip;

        if (RateLimiter::tooManyAttempts($llave, self::MAX_MENSAJES)) {
            $minutos = (int) ceil(RateLimiter::availableIn($llave) / 60);

            throw ValidationException::withMessages([
                'mensaje' => "Ya envió varios mensajes seguidos. Espere {$minutos} ".($minutos === 1 ? 'minuto' : 'minutos').' antes de enviar otro.',
            ])->status(429);
        }

        RateLimiter::hit($llave, self::LAPSO_SEGUNDOS);

        if ($automatico) {
            return;
        }

        MensajeContacto::create([
            ...$datos,
            'ip' => $ip,
            'navegador' => mb_substr((string) $navegador, 0, 255) ?: null,
        ]);
    }
}
