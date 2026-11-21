<?php

use App\Modulos\Graduados\Controller;
use Illuminate\Support\Facades\Route;

Route::get('/graduados', [Controller::class, 'listarPublicos']);
Route::get('/gestion/graduados/exportar', [Controller::class, 'exportarCsv'])->middleware(['auth:sanctum', 'permiso:graduados.ver']);

Route::middleware('auth:sanctum')->prefix('gestion/graduados')->group(function () {
    Route::get('/', [Controller::class, 'index'])->middleware('permiso:graduados.ver');
    Route::post('/', [Controller::class, 'store'])->middleware('permiso:graduados.crear');
    Route::put('/{id}', [Controller::class, 'update'])->middleware('permiso:graduados.editar');
    Route::delete('/{id}', [Controller::class, 'destroy'])->middleware('permiso:graduados.eliminar');
});
