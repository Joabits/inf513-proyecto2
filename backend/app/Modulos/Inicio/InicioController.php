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
}
