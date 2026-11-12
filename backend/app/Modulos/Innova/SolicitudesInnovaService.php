<?php

namespace App\Modulos\Innova;

use App\Compartido\Servicios\Bitacora;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

/** Solicitudes de servicio a INNOVA: las envía un visitante (CU-09) y las atiende el personal (CU-23). */
class SolicitudesInnovaService
{
    private const MAX_SOLICITUDES = 5;

    private const LAPSO_SEGUNDOS = 600;

    public function __construct(private Bitacora $bitacora) {}

    /**
     * Guarda la solicitud con estado «pendiente». Si viene de un programa automático
     * responde como si la hubiera guardado, pero la descarta.
     */
    public function enviar(array $datos, bool $automatico, ?string $ip, ?string $navegador): void
    {
        if (! Innova::recibeSolicitudes()) {
            throw ValidationException::withMessages([
                'descripcion' => 'INNOVA no está recibiendo solicitudes por ahora. Vuelva a intentarlo más adelante.',
            ]);
        }

        $llave = 'innova:'.$ip;

        if (RateLimiter::tooManyAttempts($llave, self::MAX_SOLICITUDES)) {
            $minutos = (int) ceil(RateLimiter::availableIn($llave) / 60);

            throw ValidationException::withMessages([
                'descripcion' => "Ya envió varias solicitudes seguidas. Espere {$minutos} ".($minutos === 1 ? 'minuto' : 'minutos').' antes de enviar otra.',
            ])->status(429);
        }

        RateLimiter::hit($llave, self::LAPSO_SEGUNDOS);

        if ($automatico) {
            return;
        }

        $servicioId = $datos['servicio_id'] ?? null;
        unset($datos['servicio_id']);

        SolicitudInnova::create([
            ...$datos,
            // Se guarda el nombre: la solicitud no depende de que el servicio siga en la lista
            'servicio' => $servicioId ? ServicioInnova::whereKey($servicioId)->value('nombre') : null,
            'ip' => $ip,
            'navegador' => mb_substr((string) $navegador, 0, 255) ?: null,
        ]);
    }

    /** Las más recientes primero. Son pocas: el panel filtra sin volver a pedir. */
    public function listar(): Collection
    {
        return SolicitudInnova::with('atendente')->latest()->latest('id')->get();
    }

    public function atender(SolicitudInnova $solicitud, string $estado, ?string $respuesta, User $usuario): SolicitudInnova
    {
        $estadoAnterior = $solicitud->estado;

        $solicitud->update([
            'estado' => $estado,
            'respuesta' => $respuesta,
            'atendida_por' => $usuario->id,
            'atendida_en' => now(),
        ]);

        $detalle = $estadoAnterior === $estado
            ? 'Nota actualizada ('.SolicitudInnova::ESTADOS[$estado].')'
            : SolicitudInnova::ESTADOS[$estadoAnterior].' -> '.SolicitudInnova::ESTADOS[$estado];

        $this->bitacora->accion($usuario, 'atender', $solicitud, $detalle);

        return $solicitud->load('atendente');
    }
}
