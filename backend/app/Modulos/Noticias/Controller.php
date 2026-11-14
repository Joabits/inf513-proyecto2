<?php

namespace App\Modulos\Noticias;

use App\Http\Controllers\Controller as BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class Controller extends BaseController
{
    public function __construct(
        protected Service $service,
    ) {}

    public function index(HttpRequest $request): AnonymousResourceCollection
    {
        $soloPublicadas = ! $request->boolean('todas');
        $noticias = $this->service->listar($soloPublicadas);

        return Resource::collection($noticias);
    }

    public function show(int $id): Resource
    {
        $noticia = $this->service->obtener($id);

        return new Resource($noticia);
    }

    public function store(Request $request): JsonResponse
    {
        $noticia = $this->service->crear($request->validated(), (int) $request->user()->id);

        return (new Resource($noticia))
            ->response()
            ->setStatusCode(201);
    }

    public function update(int $id, Request $request): Resource
    {
        $noticia = $this->service->actualizar($id, $request->validated());

        return new Resource($noticia);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->eliminar($id);

        return response()->json(['mensaje' => 'Noticia eliminada correctamente']);
    }
}
