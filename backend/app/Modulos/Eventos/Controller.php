<?php

namespace App\Modulos\Eventos;

use App\Compartido\Servicios\Bitacora;
use App\Http\Controllers\Controller as BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Response;

class Controller extends BaseController
{
    public function __construct(private Service $servicio, private Bitacora $bitacora) {}

    /**
     * Quien gestiona eventos puede pedir también los ocultos (el panel envía solo_publicados=0). Lo demás, incluida
     * la página pública, recibe solo lo publicado y en su versión pública, sin datos internos.
     */
    public function index(HttpRequest $request): AnonymousResourceCollection
    {
        if ($this->gestiona($request) && ! $request->boolean('solo_publicados')) {
            return Resource::collection($this->servicio->listar(false));
        }

        return EventoPublicoResource::collection($this->servicio->listar(true));
    }

    /** Un evento oculto no existe para el visitante (404), aunque sepa su número. */
    public function show(int $id, HttpRequest $request): JsonResource
    {
        $evento = $this->servicio->obtenerPorId($id);

        if ($this->gestiona($request)) {
            return new Resource($evento);
        }

        abort_unless($evento->publicado, 404);

        return new EventoPublicoResource($evento);
    }

    private function gestiona(HttpRequest $request): bool
    {
        return (bool) $request->user('sanctum')?->tienePermiso('eventos.ver');
    }

    public function store(Request $request): JsonResponse
    {
        $evento = $this->servicio->crear($request->validated(), $request->user()->id);
        $this->bitacora->accion($request->user(), 'crear', "Evento #{$evento->id}", $evento->titulo);

        return (new Resource($evento))->response()->setStatusCode(201);
    }

    public function update(Request $request, int $id): Resource
    {
        $antes = Model::findOrFail($id)->getAttributes();
        $evento = $this->servicio->actualizar($id, $request->validated());
        $this->bitacora->accion($request->user(), 'editar', "Evento #{$id}", $evento->titulo, Bitacora::comparar($antes, $evento));

        return new Resource($evento);
    }

    public function destroy(int $id, HttpRequest $request): Response
    {
        $titulo = Model::findOrFail($id)->titulo;
        $this->servicio->eliminar($id);
        $this->bitacora->accion($request->user(), 'eliminar', "Evento #{$id}", $titulo);

        return response()->noContent();
    }
}
