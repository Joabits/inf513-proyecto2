<?php

namespace App\Modulos\Documentos;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentosController extends Controller
{
    public function __construct(private DocumentosService $servicio) {}

    public function listar()
    {
        return DocumentoResource::collection($this->servicio->listar());
    }

    public function crear(GuardarDocumentoRequest $request)
    {
        $documento = $this->servicio->crear($request->safe()->except('archivo'), $request->file('archivo'), $request->user());

        return new DocumentoResource($documento->loadCount('versiones'));
    }

    public function actualizar(GuardarDocumentoRequest $request, Documento $documento)
    {
        $documento = $this->servicio->actualizar($documento, $request->safe()->except('archivo'), $request->file('archivo'), $request->user());

        return new DocumentoResource($documento->loadCount('versiones'));
    }

    public function eliminar(Request $request, Documento $documento)
    {
        $this->servicio->eliminar($documento, $request->user());

        return response()->noContent();
    }

    public function versiones(Documento $documento)
    {
        return DocumentoVersionResource::collection($documento->versiones);
    }

    /** Descarga pública: un documento oculto responde como si no existiera. */
    public function descargarPublico(Documento $documento): StreamedResponse
    {
        abort_unless($documento->publicado, 404);

        return $this->entregar($documento->archivo, $documento->titulo, $documento->tipo);
    }

    /** Desde el panel se abre cualquier documento, publicado o no. */
    public function descargar(Documento $documento): StreamedResponse
    {
        return $this->entregar($documento->archivo, $documento->titulo, $documento->tipo);
    }

    public function descargarVersion(Documento $documento, DocumentoVersion $version): StreamedResponse
    {
        abort_unless($version->documento_id === $documento->id, 404);

        return $this->entregar($version->archivo, $documento->titulo.' version anterior', $version->tipo);
    }

    /** El PDF se abre en el navegador y el Excel se descarga. El nombre sale del título, no del archivo subido. */
    private function entregar(string $archivo, string $titulo, string $tipo): StreamedResponse
    {
        $nombre = (Str::slug($titulo) ?: 'documento').'.'.$tipo;

        return Storage::disk(DocumentosService::DISCO)->response($archivo, $nombre, [], $tipo === 'pdf' ? 'inline' : 'attachment');
    }
}
