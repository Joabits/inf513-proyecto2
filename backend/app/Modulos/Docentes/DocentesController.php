<?php

namespace App\Modulos\Docentes;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DocentesController extends Controller
{
    public function __construct(private DocentesService $servicio) {}

    public function publica()
    {
        return PersonaResource::collection($this->servicio->publica());
    }

    public function gestion()
    {
        return PersonaResource::collection($this->servicio->gestion());
    }

    public function crear(GuardarPersonaRequest $request)
    {
        $persona = $this->servicio->crear($request->safe()->except(['foto', 'quitar_foto']), $request->file('foto'), $request->user());

        return new PersonaResource($persona);
    }

    public function actualizar(GuardarPersonaRequest $request, Persona $persona)
    {
        $persona = $this->servicio->actualizar(
            $persona,
            $request->safe()->except(['foto', 'quitar_foto']),
            $request->file('foto'),
            $request->boolean('quitar_foto'),
            $request->user(),
        );

        return new PersonaResource($persona);
    }

    public function eliminar(Request $request, Persona $persona)
    {
        $this->servicio->eliminar($persona, $request->user());

        return response()->noContent();
    }

    public function ordenar(OrdenarPersonasRequest $request)
    {
        $this->servicio->ordenar($request->validated('grupo'), $request->validated('ids'), $request->user());

        return PersonaResource::collection($this->servicio->gestion());
    }
}
