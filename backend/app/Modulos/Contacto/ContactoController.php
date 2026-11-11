<?php

namespace App\Modulos\Contacto;

use App\Http\Controllers\Controller;

class ContactoController extends Controller
{
    public function __construct(private ContactoService $servicio) {}

    public function enviar(EnviarMensajeRequest $request)
    {
        $datos = $request->safe()->except(EnviarMensajeRequest::TRAMPA);

        $this->servicio->enviar($datos, $request->esAutomatico(), $request->ip(), $request->userAgent());

        return response()->json(['mensaje' => 'Gracias por escribirnos. Le responderemos a su correo lo antes posible.'], 201);
    }
}
