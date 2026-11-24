<?php

use App\Modulos\Estadisticas\EstadisticasController;
use Illuminate\Support\Facades\Route;

// Estadísticas del panel: visitas, ingresos, acciones y secciones más usadas (menú «Estadísticas»)
Route::get('/gestion/estadisticas', [EstadisticasController::class, 'resumen'])
    ->middleware(['auth:sanctum', 'permiso:estadisticas.ver']);
