<?php

namespace App\Modulos\Visitas;

use Illuminate\Support\Facades\DB;

class VisitaService
{
    /** Suma una visita a la página y devuelve el total actualizado. */
    public function registrar(string $pagina): int
    {
        return DB::transaction(function () use ($pagina) {
            $visita = VisitaPagina::lockForUpdate()->firstOrCreate(['pagina' => $pagina]);
            $visita->increment('total');

            return $visita->total;
        });
    }
}
