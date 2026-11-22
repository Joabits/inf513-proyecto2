<?php

namespace App\Modulos\Noticias;

use App\Http\Controllers\Controller as BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Resources\Json\JsonResource;

class Controller extends BaseController
{
    public function __construct(
        protected Service $service,
    ) {}

    /**
     * El panel pide ?todas=1 para ver también los borradores. Solo quien gestiona noticias puede: antes cualquier
     * visitante los obtenía con ese parámetro. Al público se le entrega la versión pública, sin datos internos.
     */
    public function index(HttpRequest $request): AnonymousResourceCollection
    {
        if ($request->boolean('todas') && $this->gestiona($request)) {
            return Resource::collection($this->service->listar(false));
        }

        return NoticiaPublicaResource::collection($this->service->listar(true));
    }

    /** Un borrador no existe para el visitante (404), aunque sepa su número. */
    public function show(int $id, HttpRequest $request): JsonResource
    {
        $noticia = $this->service->obtener($id);

        if ($this->gestiona($request)) {
            return new Resource($noticia);
        }

        abort_unless($noticia->publicada, 404);

        return new NoticiaPublicaResource($noticia);
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

    private function gestiona(HttpRequest $request): bool
    {
        return (bool) $request->user('sanctum')?->tienePermiso('noticias.ver');
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->eliminar($id);

        return response()->json(['mensaje' => 'Noticia eliminada correctamente']);
    }
}
