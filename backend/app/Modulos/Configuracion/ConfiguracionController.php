<?php

namespace App\Modulos\Configuracion;

use App\Http\Controllers\Controller;

class ConfiguracionController extends Controller
{
    public function __construct(private ConfiguracionService $servicio) {}

    /** Público: lo usan el pie de todas las páginas y la página de contacto. */
    public function mostrar()
    {
        ['contacto' => $contacto, 'redes' => $redes, 'enlaces' => $enlaces] = $this->servicio->configuracion();

        return [
            'contacto' => $contacto ? [
                'direccion' => $contacto->direccion,
                'referencia' => $contacto->referencia,
                'ciudad' => $contacto->ciudad,
                'telefono' => $contacto->telefono,
                'whatsapp' => $contacto->whatsapp,
                'correo' => $contacto->correo,
                'horario' => $contacto->horario,
                'mapa_url' => $contacto->mapa_url,
            ] : null,
            'redes' => $redes->map(fn (RedSocial $r) => ['red' => $r->red, 'url' => $r->url])->all(),
            'enlaces' => $enlaces->map(fn (EnlaceInteres $e) => ['titulo' => $e->titulo, 'url' => $e->url])->all(),
        ];
    }

    public function actualizarContacto(ActualizarContactoRequest $request)
    {
        $this->servicio->actualizarContacto($request->validated(), $request->user());

        return $this->mostrar();
    }

    public function guardarRedes(GuardarRedesRequest $request)
    {
        $this->servicio->guardarRedes($request->validated('redes'), $request->user());

        return $this->mostrar();
    }

    public function guardarEnlaces(GuardarEnlacesRequest $request)
    {
        $this->servicio->guardarEnlaces($request->validated('enlaces'), $request->user());

        return $this->mostrar();
    }
}
