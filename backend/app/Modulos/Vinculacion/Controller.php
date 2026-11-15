<?php

namespace App\Modulos\Vinculacion;

use App\Http\Controllers\Controller as BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class Controller extends BaseController
{
    public function __construct(private Service $servicio) {}

    public function index(HttpRequest $request): AnonymousResourceCollection
    {
        $soloPublicados = true;
        if ($request->user('sanctum')?->tienePermiso('vinculacion.ver')) {
            $soloPublicados = $request->boolean('solo_publicados');
        }

        $vinculaciones = $this->servicio->listar($soloPublicados);

        return Resource::collection($vinculaciones);
    }

    public function show(int $id, HttpRequest $request): Resource
    {
        $vinculacion = $this->servicio->obtener($id);

        if (! $vinculacion->publicado) {
            $puedeVer = $request->user('sanctum')?->tienePermiso('vinculacion.ver');
            if (! $puedeVer) {
                abort(404, 'Vinculación no encontrada.');
            }
        }

        return new Resource($vinculacion);
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validated();
        $userId = (int) $request->user()->id;

        $registro = $this->servicio->crear($datos, $userId);

        return (new Resource($registro))->response()->setStatusCode(201);
    }

    public function update(int $id, Request $request): Resource
    {
        $datos = $request->validated();
        $registro = $this->servicio->actualizar($id, $datos);

        return new Resource($registro);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->servicio->eliminar($id);

        return response()->json(['mensaje' => 'Vinculación eliminada correctamente.']);
    }
}

if (! class_exists('App\Modulos\Vinculacion\VinculacionController', false)) {
    class_alias(Controller::class, 'App\Modulos\Vinculacion\VinculacionController');
}
