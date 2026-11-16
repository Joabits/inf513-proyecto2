<?php

use App\Modulos\Bitacora\BitacoraController;
use Illuminate\Support\Facades\Route;

// CU-29 Consultar bitácora de actividad: solo lectura; exportar requiere su propio permiso
Route::middleware('auth:sanctum')->prefix('gestion/bitacora')->group(function () {
    Route::get('/', [BitacoraController::class, 'listar'])->middleware('permiso:bitacora.ver');
    Route::get('/opciones', [BitacoraController::class, 'opciones'])->middleware('permiso:bitacora.ver');
    Route::get('/exportar', [BitacoraController::class, 'exportar'])->middleware('permiso:bitacora.exportar');
});
