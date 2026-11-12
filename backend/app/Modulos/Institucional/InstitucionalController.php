<?php

namespace App\Modulos\Institucional;

use App\Http\Controllers\Controller;

class InstitucionalController extends Controller
{
    public function __construct(private InstitucionalService $servicio) {}

    /** Público: página «La Carrera». */
    public function mostrar()
    {
        ['contenido' => $contenido, 'hitos' => $hitos] = $this->servicio->informacion();

        return [
            'contenido' => $contenido ? [
                'presentacion' => $contenido->presentacion,
                'resena_historica' => $contenido->resena_historica,
                'mision' => $contenido->mision,
                'vision' => $contenido->vision,
                'perfil_profesional' => $contenido->perfil_profesional,
                'campo_ocupacional' => $contenido->campo_ocupacional,
                'fecha_creacion' => $contenido->fecha_creacion?->toDateString(),
                'resolucion' => $contenido->resolucion,
                'acreditacion' => $contenido->acreditacion,
                'actualizado' => $contenido->updated_at?->toIso8601String(),
            ] : null,
            'hitos' => $hitos->map(fn (Hito $h) => ['anio' => $h->anio, 'titulo' => $h->titulo, 'descripcion' => $h->descripcion])->all(),
        ];
    }

    public function actualizarContenido(ActualizarContenidoRequest $request)
    {
        $this->servicio->actualizarContenido($request->validated(), $request->user());

        return $this->mostrar();
    }

    public function guardarHitos(GuardarHitosRequest $request)
    {
        $this->servicio->guardarHitos($request->validated('hitos'), $request->user());

        return $this->mostrar();
    }
}
