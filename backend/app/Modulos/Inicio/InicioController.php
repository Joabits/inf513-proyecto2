<?php

namespace App\Modulos\Inicio;

use App\Http\Controllers\Controller;

class InicioController extends Controller
{
    public function __construct(private InicioService $servicio) {}

    public function mostrar()
    {
        $contenido = $this->servicio->contenido();

        return [
            'portada' => $contenido['portada'] ? new PortadaResource($contenido['portada']) : null,
            'banners' => BannerResource::collection($contenido['banners']),
            'cifras' => CifraResource::collection($contenido['cifras']),
            'accesos' => AccesoResource::collection($contenido['accesos']),
        ];
    }

    public function actualizarPortada(ActualizarPortadaRequest $request)
    {
        $this->servicio->actualizarPortada($request->validated(), $request->user());

        return $this->mostrar();
    }

    public function guardarCifras(GuardarCifrasRequest $request)
    {
        $this->servicio->guardarCifras($request->validated('cifras'), $request->user());

        return $this->mostrar();
    }

    public function guardarAccesos(GuardarAccesosRequest $request)
    {
        $this->servicio->guardarAccesos($request->validated('accesos'), $request->user());

        return $this->mostrar();
    }
}
