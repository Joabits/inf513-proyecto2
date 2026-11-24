<?php

namespace App\Modulos\Vinculacion;

use App\Compartido\Servicios\Bitacora;
use App\Http\Controllers\Controller as BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Resources\Json\JsonResource;

class Controller extends BaseController
{
    public function __construct(private Service $servicio, private Bitacora $bitacora) {}

    /**
     * El panel pide ?todas=1 para ver también los borradores (como en noticias). Antes, quien tenía sesión veía los
     * borradores también en la página pública /vinculacion. Al público se le entrega la versión pública.
     */
    public function index(HttpRequest $request): AnonymousResourceCollection
    {
        if ($request->boolean('todas') && $this->gestiona($request)) {
            return Resource::collection($this->servicio->listar(false));
        }

        return VinculacionPublicaResource::collection($this->servicio->listar(true));
    }

    /** Un borrador no existe para el visitante (404), aunque sepa su número. */
    public function show(int $id, HttpRequest $request): JsonResource
    {
        $vinculacion = $this->servicio->obtener($id);

        if ($this->gestiona($request)) {
            return new Resource($vinculacion);
        }

        abort_unless($vinculacion->publicado, 404, 'Vinculación no encontrada.');

        return new VinculacionPublicaResource($vinculacion);
    }

    public function store(Request $request): JsonResponse
    {
        $registro = $this->servicio->crear($request->validated(), (int) $request->user()->id);
        $this->bitacora->accion($request->user(), 'crear', "Vinculación #{$registro->id}", $registro->titulo);

        return (new Resource($registro))->response()->setStatusCode(201);
    }

    public function update(int $id, Request $request): Resource
    {
        $antes = Model::findOrFail($id)->getAttributes();
        $registro = $this->servicio->actualizar($id, $request->validated());
        $this->bitacora->accion($request->user(), 'editar', "Vinculación #{$id}", $registro->titulo, Bitacora::comparar($antes, $registro));

        return new Resource($registro);
    }

    public function destroy(int $id, HttpRequest $request): JsonResponse
    {
        $titulo = Model::findOrFail($id)->titulo;
        $this->servicio->eliminar($id);
        $this->bitacora->accion($request->user(), 'eliminar', "Vinculación #{$id}", $titulo);

        return response()->json(['mensaje' => 'Vinculación eliminada correctamente.']);
    }

    private function gestiona(HttpRequest $request): bool
    {
        return (bool) $request->user('sanctum')?->tienePermiso('vinculacion.ver');
    }
}

if (! class_exists('App\Modulos\Vinculacion\VinculacionController', false)) {
    class_alias(Controller::class, 'App\Modulos\Vinculacion\VinculacionController');
}
