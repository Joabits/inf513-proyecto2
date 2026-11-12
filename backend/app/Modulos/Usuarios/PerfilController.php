<?php

namespace App\Modulos\Usuarios;

use App\Http\Controllers\Controller;

/** «Mi perfil»: cualquier cuenta con sesión cambia sus propios datos (no su rol) y su contraseña. */
class PerfilController extends Controller
{
    public function __construct(private UsuariosService $servicio) {}

    public function actualizar(ActualizarPerfilRequest $request)
    {
        $usuario = $this->servicio->actualizarPerfil($request->user(), $request->validated());

        return ['data' => ['nombre' => $usuario->name, 'email' => $usuario->email]];
    }

    public function cambiarClave(CambiarMiClaveRequest $request)
    {
        // La sesión desde la que se cambia sigue abierta; las demás de esa cuenta se cierran
        $sesionActual = $request->hasSession() ? $request->session()->getId() : null;
        $this->servicio->cambiarMiClave($request->user(), $request->validated('password'), $sesionActual);

        return response()->noContent();
    }
}
