<?php

use App\Modulos\Graduados\Controller;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->prefix('gestion/graduados')->group(function () {
    Route::get('/', [Controller::class, 'index'])->middleware('permiso:graduados.ver');
    Route::post('/', [Controller::class, 'store'])->middleware('permiso:graduados.crear');
    Route::put('/{id}', [Controller::class, 'update'])->middleware('permiso:graduados.editar');
    Route::delete('/{id}', [Controller::class, 'destroy'])->middleware('permiso:graduados.eliminar');
});
