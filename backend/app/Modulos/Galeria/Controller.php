<?php

namespace App\Modulos\Galeria;

use App\Compartido\Servicios\Bitacora;
use App\Http\Controllers\Controller as BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Resources\Json\JsonResource;

class Controller extends BaseController
{
    public function __construct(private Service $servicio, private Bitacora $bitacora) {}

    public function index(HttpRequest $request): AnonymousResourceCollection
    {
        $esEditor = (bool) $request->user('sanctum')?->tienePermiso('galeria.ver');

        // El panel (sin parámetros) ve todo, con los datos internos; lo público, solo lo publicado y sin ellos
        if ($esEditor && ! $request->boolean('publicadas')) {
            return Resource::collection($this->servicio->listar(false));
        }

        return GaleriaPublicaResource::collection($this->servicio->listar(true));
    }

    public function show(int $id, HttpRequest $request): JsonResource
    {
        $galeria = $this->servicio->obtener($id);

        $esEditor = (bool) $request->user('sanctum')?->tienePermiso('galeria.ver');
        if (! $galeria->publicado && ! $esEditor) {
            abort(404, 'Elemento no encontrado o no publicado.');
        }

        return $esEditor ? new Resource($galeria) : new GaleriaPublicaResource($galeria);
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validated();
        $galeria = $this->servicio->crear($datos, $request->user()->id);
        $this->bitacora->accion($request->user(), 'crear', "Galería #{$galeria->id}", $galeria->titulo);

        return (new Resource($galeria))
            ->response()
            ->setStatusCode(201);
    }

    public function update(Request $request, int $id): Resource
    {
        $datos = $request->validated();
        $antes = Model::findOrFail($id)->getAttributes();
        $galeria = $this->servicio->actualizar($id, $datos);
        $this->bitacora->accion($request->user(), 'editar', "Galería #{$id}", $galeria->titulo, Bitacora::comparar($antes, $galeria));

        return new Resource($galeria);
    }

    public function destroy(int $id, HttpRequest $request): JsonResponse
    {
        $titulo = Model::findOrFail($id)->titulo;
        $this->servicio->eliminar($id);
        $this->bitacora->accion($request->user(), 'eliminar', "Galería #{$id}", $titulo);

        return response()->json([
            'mensaje' => 'Elemento de la galería eliminado correctamente.',
        ]);
    }
}
