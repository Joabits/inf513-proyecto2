<?php

namespace App\Modulos\Revista;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RevistaController extends Controller
{
    public function __construct(private RevistaService $servicio) {}

    /** Público: página «Revista INNOVAR». */
    public function publica()
    {
        return $this->respuesta($this->servicio->publica());
    }

    public function gestion()
    {
        return $this->respuesta($this->servicio->gestion());
    }

    /** Cada cambio devuelve la revista completa del panel: queda en caché y la vista se actualiza sin otra petición. */
    public function actualizarContenido(ActualizarContenidoRevistaRequest $request)
    {
        $this->servicio->actualizarContenido($request->validated(), $request->user());

        return $this->gestion();
    }

    public function crearEdicion(GuardarEdicionRequest $request)
    {
        $this->servicio->crearEdicion($this->datosEdicion($request), $request->file('portada'), $request->file('archivo'), $request->user());

        return $this->gestion();
    }

    public function actualizarEdicion(GuardarEdicionRequest $request, Edicion $edicion)
    {
        $this->servicio->actualizarEdicion(
            $edicion,
            $this->datosEdicion($request),
            $request->file('portada'),
            $request->file('archivo'),
            $request->boolean('quitar_portada'),
            $request->boolean('quitar_archivo'),
            $request->user(),
        );

        return $this->gestion();
    }

    public function cambiarPublicacion(CambiarPublicacionRequest $request, Edicion $edicion)
    {
        $this->servicio->cambiarPublicacion($edicion, $request->boolean('publicada'), $request->user());

        return $this->gestion();
    }

    public function eliminarEdicion(Request $request, Edicion $edicion)
    {
        $this->servicio->eliminarEdicion($edicion, $request->user());

        return $this->gestion();
    }

    public function crearArticulo(GuardarArticuloRequest $request, Edicion $edicion)
    {
        $this->servicio->crearArticulo($edicion, $request->safe()->except(['archivo', 'quitar_archivo']), $request->file('archivo'), $request->user());

        return $this->gestion();
    }

    public function actualizarArticulo(GuardarArticuloRequest $request, Articulo $articulo)
    {
        $this->servicio->actualizarArticulo(
            $articulo,
            $request->safe()->except(['archivo', 'quitar_archivo']),
            $request->file('archivo'),
            $request->boolean('quitar_archivo'),
            $request->user(),
        );

        return $this->gestion();
    }

    public function eliminarArticulo(Request $request, Articulo $articulo)
    {
        $this->servicio->eliminarArticulo($articulo, $request->user());

        return $this->gestion();
    }

    public function ordenarArticulos(OrdenarArticulosRequest $request, Edicion $edicion)
    {
        $this->servicio->ordenarArticulos($edicion, $request->validated('ids'), $request->user());

        return $this->gestion();
    }

    // ---------- Descargas ----------

    /** Público: una edición sin publicar responde como si no existiera. */
    public function descargarEdicionPublica(Edicion $edicion): StreamedResponse
    {
        abort_unless($edicion->publicada, 404);

        return $this->entregar($edicion->archivo, 'INNOVAR '.$edicion->nombre());
    }

    public function descargarArticuloPublico(Articulo $articulo): StreamedResponse
    {
        abort_unless($articulo->edicion->publicada, 404);

        return $this->entregar($articulo->archivo, $articulo->titulo);
    }

    /** Desde el panel se abre cualquier archivo, publicado o no. */
    public function descargarEdicion(Edicion $edicion): StreamedResponse
    {
        return $this->entregar($edicion->archivo, 'INNOVAR '.$edicion->nombre());
    }

    public function descargarArticulo(Articulo $articulo): StreamedResponse
    {
        return $this->entregar($articulo->archivo, $articulo->titulo);
    }

    /** El PDF se abre en el navegador. El nombre sale del título, no del archivo subido. */
    private function entregar(?string $ruta, string $titulo): StreamedResponse
    {
        abort_unless($ruta, 404);

        return Storage::disk(RevistaService::DISCO_PDF)->response($ruta, (Str::slug($titulo) ?: 'innovar').'.pdf', [], 'inline');
    }

    private function datosEdicion(GuardarEdicionRequest $request): array
    {
        return $request->safe()->except(['portada', 'archivo', 'quitar_portada', 'quitar_archivo']);
    }

    private function respuesta(array $contenido): array
    {
        return [
            'revista' => $contenido['revista'] ? [
                'presentacion' => $contenido['revista']->presentacion,
                'colaboradores' => $contenido['revista']->colaboradores,
            ] : null,
            'ediciones' => EdicionResource::collection($contenido['ediciones'])->resolve(),
        ];
    }
}
