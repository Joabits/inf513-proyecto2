<?php

namespace App\Compartido\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Matriz de acceso: la ruta solo se ejecuta si el rol del usuario tiene el permiso en la BD.
 * Uso en rutas.php de cada módulo:
 *   Route::post('/noticias', ...)->middleware(['auth:sanctum', 'permiso:noticias.crear']);
 */
class VerificarPermiso
{
    public function handle(Request $request, Closure $next, string $permiso): Response
    {
        abort_unless($request->user()?->tienePermiso($permiso), 403, 'No tiene permiso para realizar esta acción.');

        return $next($request);
    }
}
