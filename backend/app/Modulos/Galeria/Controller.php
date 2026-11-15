<?php

namespace App\Modulos\Galeria;

use App\Http\Controllers\Controller as BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class Controller extends BaseController
{
    public function __construct(private Service $servicio) {}

    public function index(HttpRequest $request): AnonymousResourceCollection
    {
        $esEditor = $request->user() && $request->user()->tienePermiso('galeria.ver');
        $soloPublicadas = ! $esEditor || $request->boolean('publicadas');

        $items = $this->servicio->listar($soloPublicadas);

        return Resource::collection($items);
    }

    public function show(int $id, HttpRequest $request): Resource
    {
        $galeria = $this->servicio->obtener($id);

        $esEditor = $request->user() && $request->user()->tienePermiso('galeria.ver');
        if (! $galeria->publicado && ! $esEditor) {
            abort(404, 'Elemento no encontrado o no publicado.');
        }

        return new Resource($galeria);
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validated();
        $galeria = $this->servicio->crear($datos, $request->user()->id);

        return (new Resource($galeria))
            ->response()
            ->setStatusCode(201);
    }

    public function update(Request $request, int $id): Resource
    {
        $datos = $request->validated();
        $galeria = $this->servicio->actualizar($id, $datos);

        return new Resource($galeria);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->servicio->eliminar($id);

        return response()->json([
            'mensaje' => 'Elemento de la galería eliminado correctamente.',
        ]);
    }
}
