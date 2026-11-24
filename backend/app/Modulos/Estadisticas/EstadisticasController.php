<?php

namespace App\Modulos\Estadisticas;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EstadisticasController extends Controller
{
    public function __construct(private EstadisticasService $servicio) {}

    /** ?dias=7|30|90 (30 por defecto). */
    public function resumen(Request $request): JsonResponse
    {
        $datos = $request->validate(
            ['dias' => ['nullable', 'integer', Rule::in(EstadisticasService::DIAS_PERMITIDOS)]],
            ['dias.in' => 'El periodo debe ser de 7, 30 o 90 días.'],
        );

        return response()->json($this->servicio->resumen((int) ($datos['dias'] ?? 30)));
    }
}
