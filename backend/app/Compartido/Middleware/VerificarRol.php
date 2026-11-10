<?php

namespace App\Compartido\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Restringe una ruta a ciertos roles.
 * Uso: ->middleware(['auth:sanctum', 'rol:director,editor_comunicacion'])
 */
class VerificarRol
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $usuario = $request->user();

        abort_unless($usuario && $usuario->activo && $usuario->tieneRol(...$roles), 403, 'No tiene permiso para realizar esta acción.');

        return $next($request);
    }
}
