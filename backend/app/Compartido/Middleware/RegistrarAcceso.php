<?php

namespace App\Compartido\Middleware;

use App\Compartido\Servicios\Bitacora;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Registra en la bitácora cada llamada a la API (recurso, método, usuario e IP),
 * para las estadísticas de "recursos más accedidos" (req. 4 y 8).
 */
class RegistrarAcceso
{
    /** Llamadas que hace cada página automáticamente y no son un recurso del negocio. */
    private const IGNORADAS = ['api/visitas', 'api/sesion', 'api/menu', 'api/ping'];

    public function __construct(private Bitacora $bitacora) {}

    public function handle(Request $request, Closure $next): Response
    {
        return $next($request);
    }

    /** Se ejecuta después de enviar la respuesta: no hace más lenta la petición. */
    public function terminate(Request $request, Response $response): void
    {
        $uri = $request->route()?->uri();

        if (! $uri || in_array($uri, self::IGNORADAS, true)) {
            return;
        }

        $this->bitacora->acceso($request->user('sanctum'), $request->method(), $uri, $response->getStatusCode());
    }
}
