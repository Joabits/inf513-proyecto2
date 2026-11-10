<?php

namespace App\Modulos\Visitas;

use Illuminate\Support\Facades\DB;

class VisitaService
{
    /**
     * Guarda la visita en "visitas". El trigger trg_contar_visita de la BD
     * actualiza el total en "visitas_pagina", que es lo que se devuelve.
     */
    public function registrar(string $pagina, ?int $userId, ?string $ip): int
    {
        return DB::transaction(function () use ($pagina, $userId, $ip) {
            DB::table('visitas')->insert([
                'pagina' => $pagina,
                'user_id' => $userId,
                'ip' => $ip,
                'created_at' => now(),
            ]);

            return (int) DB::table('visitas_pagina')->where('pagina', $pagina)->value('total');
        });
    }
}
