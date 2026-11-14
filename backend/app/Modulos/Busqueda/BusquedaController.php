<?php

namespace App\Modulos\Busqueda;

use App\Http\Controllers\Controller;

class BusquedaController extends Controller
{
    public function __construct(private BusquedaService $servicio) {}

    public function buscar(BuscarRequest $request)
    {
        return $this->servicio->buscar($request->validated('q'), $request->validated('tipo'));
    }
}
