<?php

namespace App\Modulos\Usuarios;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UsuariosController extends Controller
{
    public function __construct(private UsuariosService $servicio) {}

    public function listar()
    {
        return UsuarioResource::collection($this->servicio->listar());
    }

    public function roles()
    {
        return RolResource::collection($this->servicio->roles());
    }

    public function crear(GuardarUsuarioRequest $request)
    {
        return (new UsuarioResource($this->servicio->crear($request->validated())))->response()->setStatusCode(201);
    }

    public function actualizar(GuardarUsuarioRequest $request, User $usuario)
    {
        return new UsuarioResource($this->servicio->actualizar($usuario, $request->validated(), $request->user()));
    }

    public function cambiarEstado(CambiarEstadoRequest $request, User $usuario)
    {
        return new UsuarioResource($this->servicio->cambiarEstado($usuario, $request->boolean('activo'), $request->user()));
    }

    public function cambiarClave(CambiarClaveRequest $request, User $usuario)
    {
        $this->servicio->cambiarClave($usuario, $request->validated('password'), $request->user());

        return response()->noContent();
    }

    public function eliminar(Request $request, User $usuario)
    {
        $this->servicio->eliminar($usuario, $request->user());

        return response()->noContent();
    }
}
