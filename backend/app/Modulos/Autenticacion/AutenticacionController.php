<?php

namespace App\Modulos\Autenticacion;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AutenticacionController extends Controller
{
    public function __construct(private AutenticacionService $servicio) {}

    public function login(IniciarSesionRequest $request)
    {
        // Sanctum solo abre sesión para los dominios de SANCTUM_STATEFUL_DOMAINS
        abort_unless($request->hasSession(), 403, 'Origen no autorizado para iniciar sesión.');

        $this->servicio->iniciarSesion($request->validated('email'), $request->validated('password'), $request->ip());

        $request->session()->regenerate();

        return response()->noContent();
    }

    public function logout(Request $request)
    {
        $this->servicio->cerrarSesion($request->user());

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->noContent();
    }
}
