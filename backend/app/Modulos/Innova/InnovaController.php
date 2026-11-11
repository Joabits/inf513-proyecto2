<?php

namespace App\Modulos\Innova;

use App\Http\Controllers\Controller;

class InnovaController extends Controller
{
    public function __construct(private InnovaService $servicio) {}

    /** Público: página «Empresa Junior INNOVA». */
    public function mostrar()
    {
        ['contenido' => $contenido, 'servicios' => $servicios] = $this->servicio->informacion();

        return [
            'contenido' => $contenido ? [
                'presentacion' => $contenido->presentacion,
                'mision' => $contenido->mision,
                'vision' => $contenido->vision,
                'correo' => $contenido->correo,
                'recibe_solicitudes' => $contenido->recibe_solicitudes,
            ] : null,
            'servicios' => $servicios->map(fn (ServicioInnova $s) => [
                'id' => $s->id,
                'nombre' => $s->nombre,
                'descripcion' => $s->descripcion,
            ])->all(),
        ];
    }

    public function actualizarContenido(ActualizarInnovaRequest $request)
    {
        $this->servicio->actualizarContenido($request->validated(), $request->user());

        return $this->mostrar();
    }

    public function guardarServicios(GuardarServiciosRequest $request)
    {
        $this->servicio->guardarServicios($request->validated('servicios'), $request->user());

        return $this->mostrar();
    }
}
