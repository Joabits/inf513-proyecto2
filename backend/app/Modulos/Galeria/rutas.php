<?php

use App\Modulos\Galeria\Controller as GaleriaController;
use Illuminate\Support\Facades\Route;

Route::get('/galeria', [GaleriaController::class, 'index']);
Route::get('/galeria/{id}', [GaleriaController::class, 'show'])->whereNumber('id');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/galeria', [GaleriaController::class, 'store'])
        ->middleware('permiso:galeria.crear');

    Route::match(['post', 'put'], '/galeria/{id}', [GaleriaController::class, 'update'])
        ->whereNumber('id')
        ->middleware('permiso:galeria.editar');

    Route::delete('/galeria/{id}', [GaleriaController::class, 'destroy'])
        ->whereNumber('id')
        ->middleware('permiso:galeria.eliminar');
});
