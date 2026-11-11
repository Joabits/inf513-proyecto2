<?php

namespace App\Modulos\Investigacion;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class InvestigacionController extends Controller
{
    public function __construct(private InvestigacionService $servicio) {}

    /** Público (CU-03 Consultar investigación): solo proyectos publicados. */
    public function publica()
    {
        $datos = $this->servicio->publica();

        return [
            'lineas' => LineaResource::collection($datos['lineas']),
            'proyectos' => ProyectoResource::collection($datos['proyectos']),
            ...$this->complementos($datos['contenido'], $datos['semilleros']),
        ];
    }

    /** Panel (CU-19): todo, incluso lo que no está publicado. */
    public function gestion()
    {
        $datos = $this->servicio->gestion();

        return [
            'proyectos' => ProyectoResource::collection($datos['proyectos']),
            'lineas' => LineaResource::collection($datos['lineas']),
            ...$this->complementos($datos['contenido'], $datos['semilleros']),
        ];
    }

    public function crearProyecto(GuardarProyectoRequest $request)
    {
        return new ProyectoResource($this->servicio->crearProyecto($request->validated(), $request->user()));
    }

    public function actualizarProyecto(GuardarProyectoRequest $request, Proyecto $proyecto)
    {
        return new ProyectoResource($this->servicio->actualizarProyecto($proyecto, $request->validated(), $request->user()));
    }

    public function cambiarPublicacion(CambiarPublicacionRequest $request, Proyecto $proyecto)
    {
        return new ProyectoResource($this->servicio->cambiarPublicacion($proyecto, $request->boolean('publicado'), $request->user()));
    }

    public function eliminarProyecto(Request $request, Proyecto $proyecto)
    {
        $this->servicio->eliminarProyecto($proyecto, $request->user());

        return response()->noContent();
    }

    public function guardarLineas(GuardarLineasRequest $request)
    {
        return LineaResource::collection($this->servicio->guardarLineas($request->validated('lineas'), $request->user()));
    }

    public function guardarComplementos(GuardarComplementosRequest $request)
    {
        $this->servicio->guardarComplementos(
            $request->safe()->only(array_keys(GuardarComplementosRequest::TEXTOS)),
            $request->validated('semilleros'),
            $request->user(),
        );

        $datos = $this->servicio->gestion();

        return $this->complementos($datos['contenido'], $datos['semilleros']);
    }

    /** Semilleros, PIA e instituto: igual en la vista pública y en el panel. */
    private function complementos(?ContenidoInvestigacion $contenido, $semilleros): array
    {
        return [
            'contenido' => $contenido?->only(array_keys(GuardarComplementosRequest::TEXTOS)),
            'semilleros' => $semilleros->map(fn (Semillero $s) => ['nombre' => $s->nombre, 'descripcion' => $s->descripcion])->all(),
        ];
    }
}
