<?php

namespace App\Modulos\Eventos;

use App\Http\Controllers\Controller as BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class Controller extends BaseController
{
    public function __construct(private Service $servicio) {}

    public function index(HttpRequest $request): AnonymousResourceCollection
    {
        $user = $request->user();
        $soloPublicados = true;
        if ($user && $user->tienePermiso('eventos.ver')) {
            $soloPublicados = $request->boolean('solo_publicados');
        }

        $eventos = $this->servicio->listar($soloPublicados);

        return Resource::collection($eventos);
    }

    public function show(int $id): Resource
    {
        $evento = $this->servicio->obtenerPorId($id);

        return new Resource($evento);
    }

    public function store(Request $request): JsonResponse
    {
        $evento = $this->servicio->crear($request->validated(), $request->user()->id);

        return (new Resource($evento))->response()->setStatusCode(201);
    }

    public function update(Request $request, int $id): Resource
    {
        $evento = $this->servicio->actualizar($id, $request->validated());

        return new Resource($evento);
    }

    public function destroy(int $id): Response
    {
        $this->servicio->eliminar($id);

        return response()->noContent();
    }
}
