<?php

namespace App\Modulos\Inicio;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

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

    public function agregarBanner(SubirBannerRequest $request)
    {
        $this->servicio->agregarBanner($request->file('imagen'), $request->safe()->except('imagen'), $request->user());

        return $this->mostrar();
    }

    public function eliminarBanner(Request $request, Banner $banner)
    {
        $this->servicio->eliminarBanner($banner, $request->user());

        return $this->mostrar();
    }

    public function ordenarBanners(OrdenarBannersRequest $request)
    {
        $this->servicio->ordenarBanners($request->validated('ids'), $request->user());

        return $this->mostrar();
    }

    public function cambiarFotoDirector(SubirFotoDirectorRequest $request)
    {
        $this->servicio->cambiarFotoDirector($request->file('foto'), $request->user());

        return $this->mostrar();
    }

    public function quitarFotoDirector(Request $request)
    {
        $this->servicio->quitarFotoDirector($request->user());

        return $this->mostrar();
    }
}
