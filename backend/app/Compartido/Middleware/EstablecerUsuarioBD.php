<?php

namespace App\Compartido\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

/**
 * Le dice a PostgreSQL qué usuario hace la petición, para que los triggers
 * de auditoría guarden el autor de cada cambio en la bitácora.
 */
class EstablecerUsuarioBD
{
    public function handle(Request $request, Closure $next): Response
    {
        $usuario = $request->user('sanctum');

        if ($usuario && DB::getDriverName() === 'pgsql') {
            DB::select("SELECT set_config('app.usuario_id', ?, false)", [(string) $usuario->id]);
        }

        return $next($request);
    }
}
