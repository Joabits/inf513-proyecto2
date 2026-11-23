<?php

use App\Modulos\Vinculacion\Controller as VinculacionController;
use Illuminate\Support\Facades\Route;

Route::get('/vinculaciones', [VinculacionController::class, 'index']);
Route::get('/vinculaciones/{id}', [VinculacionController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/vinculaciones', [VinculacionController::class, 'store'])->middleware('permiso:vinculacion.crear');
    Route::post('/vinculaciones/{id}', [VinculacionController::class, 'update'])->middleware('permiso:vinculacion.editar');
    Route::put('/vinculaciones/{id}', [VinculacionController::class, 'update'])->middleware('permiso:vinculacion.editar');
    Route::delete('/vinculaciones/{id}', [VinculacionController::class, 'destroy'])->middleware('permiso:vinculacion.eliminar');
});
