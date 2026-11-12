<?php

namespace App\Modulos\Innova;

use App\Http\Controllers\Controller;

class SolicitudesInnovaController extends Controller
{
    public function __construct(private SolicitudesInnovaService $servicio) {}

    /** CU-09: cualquier visitante, sin iniciar sesión. */
    public function enviar(EnviarSolicitudRequest $request)
    {
        $datos = $request->safe()->except(EnviarSolicitudRequest::TRAMPA);

        $this->servicio->enviar($datos, $request->esAutomatico(), $request->ip(), $request->userAgent());

        return response()->json([
            'mensaje' => 'Recibimos su solicitud. El equipo de INNOVA la revisará y le escribirá a su correo.',
        ], 201);
    }

    /** CU-23 */
    public function listar()
    {
        return SolicitudInnovaResource::collection($this->servicio->listar());
    }

    public function atender(AtenderSolicitudRequest $request, SolicitudInnova $solicitud)
    {
        $solicitud = $this->servicio->atender($solicitud, $request->validated('estado'), $request->validated('respuesta'), $request->user());

        return new SolicitudInnovaResource($solicitud);
    }
}
