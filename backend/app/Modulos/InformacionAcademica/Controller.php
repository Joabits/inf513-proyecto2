<?php

namespace App\Modulos\InformacionAcademica;

use App\Http\Controllers\Controller as BaseController;

class Controller extends BaseController
{
    public function __construct(private Service $service) {}

    public function index()
    {
        $info = $this->service->obtener();

        return $info ? new Resource($info) : response()->json(['data' => null]);
    }

    public function update(Request $request)
    {
        $info = $this->service->actualizar($request->validated(), $request->user()->id);

        return (new Resource($info))->response()->setStatusCode(200);
    }
}
