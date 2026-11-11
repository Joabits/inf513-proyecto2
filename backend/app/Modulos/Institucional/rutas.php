<?php

use App\Modulos\Institucional\InstitucionalController;
use Illuminate\Support\Facades\Route;

// CU-27 Gestionar información institucional
Route::get('/institucional', [InstitucionalController::class, 'mostrar']);

Route::middleware(['auth:sanctum', 'permiso:institucional.editar'])->prefix('institucional')->group(function () {
    Route::put('/contenido', [InstitucionalController::class, 'actualizarContenido']);
    Route::put('/hitos', [InstitucionalController::class, 'guardarHitos']);
});
