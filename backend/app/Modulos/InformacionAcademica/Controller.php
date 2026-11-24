<?php

namespace App\Modulos\InformacionAcademica;

use App\Compartido\Servicios\Bitacora;
use App\Http\Controllers\Controller as BaseController;

class Controller extends BaseController
{
    public function __construct(private Service $service, private Bitacora $bitacora) {}

    public function index()
    {
        $info = $this->service->obtener();

        return $info ? new Resource($info) : response()->json(['data' => null]);
    }

    public function update(Request $request)
    {
        $antes = Model::first()?->getAttributes() ?? [];
        $info = $this->service->actualizar($request->validated(), $request->user()->id);
        $this->bitacora->accion($request->user(), 'editar', 'Información académica', null, Bitacora::comparar($antes, $info));

        return (new Resource($info))->response()->setStatusCode(200);
    }
}
