<?php

namespace App\Modulos\Graduados;

use App\Http\Controllers\Controller as BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class Controller extends BaseController
{
    public function __construct(private Service $service)
    {
    }

    public function index(): AnonymousResourceCollection
    {
        return Resource::collection($this->service->listar());
    }

    public function store(Request $request): JsonResponse
    {
        $graduado = $this->service->crear($request->validated(), (int) $request->user()->id);

        return (new Resource($graduado->load('autor')))
            ->response()
            ->setStatusCode(201);
    }

    public function update(Request $request, int $id): Resource
    {
        $graduado = $this->service->actualizar($id, $request->validated());

        return new Resource($graduado->load('autor'));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->eliminar($id);

        return response()->json(['mensaje' => 'Graduado eliminado correctamente']);
    }
}
