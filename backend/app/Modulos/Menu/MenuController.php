<?php

namespace App\Modulos\Menu;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    public function __construct(private MenuService $servicio) {}

    public function index(Request $request)
    {
        // La ruta es pública; si hay sesión iniciada se agrega el menú de gestión del rol
        $menu = $this->servicio->paraUsuario($request->user('sanctum'));

        return [
            'publico' => MenuResource::collection($menu['publico']),
            'gestion' => MenuResource::collection($menu['gestion']),
        ];
    }
}
