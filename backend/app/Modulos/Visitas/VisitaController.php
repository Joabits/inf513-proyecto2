<?php

namespace App\Modulos\Visitas;

use App\Http\Controllers\Controller;

class VisitaController extends Controller
{
    public function __construct(private VisitaService $servicio) {}

    public function store(RegistrarVisitaRequest $request)
    {
        return ['total' => $this->servicio->registrar(
            $request->validated('pagina'),
            $request->user('sanctum')?->id,
            $request->ip(),
        )];
    }
}
