<?php

namespace App\Modulos\Graduados;

use App\Http\Controllers\Controller as BaseController;
use App\Modulos\Graduados\Resource as GraduadoResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\StreamedResponse;

class Controller extends BaseController
{
    private Service $servicio;

    public function __construct(private Service $service)
    {
        $this->servicio = $service;
    }

    public function index(): AnonymousResourceCollection
    {
        return Resource::collection($this->service->listar());
    }

    public function listarPublicos(): AnonymousResourceCollection
    {
        return GraduadoResource::collection($this->servicio->listar());
    }

    public function exportarCsv(): StreamedResponse
    {
        $graduados = $this->servicio->listar();
        $nombreArchivo = 'graduados_' . date('Y-m-d') . '.csv';

        return response()->streamDownload(function () use ($graduados) {
            $salida = fopen('php://output', 'w');
            // BOM UTF-8 para que Excel reconozca las tildes y caracteres especiales
            fwrite($salida, "\xEF\xBB\xBF");

            // Cabeceras del CSV
            fputcsv($salida, [
                'Nombre',
                'CI',
                'Correo',
                'Gestión Ingreso',
                'Gestión Egreso',
                'Modalidad',
                'Título',
            ]);

            foreach ($graduados as $graduado) {
                fputcsv($salida, [
                    $graduado->nombre_completo,
                    $graduado->ci,
                    $graduado->correo,
                    $graduado->gestion_ingreso,
                    $graduado->gestion_egreso,
                    $graduado->modalidad,
                    $graduado->titulo_tema ?? '',
                ]);
            }

            fclose($salida);
        }, $nombreArchivo, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
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
