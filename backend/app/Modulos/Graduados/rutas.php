<?php

use App\Modulos\Graduados\Controller;
use Illuminate\Support\Facades\Route;

// Directorio público (/alumni): solo datos académicos
Route::get('/graduados', [Controller::class, 'listarPublicos']);

// CU-18: la exportación lleva datos personales, por eso tiene su propio permiso
Route::get('/gestion/graduados/exportar', [Controller::class, 'exportarCsv'])->middleware(['auth:sanctum', 'permiso:graduados.exportar']);

// CU-10 y CU-18: el personal registra, consulta, edita y elimina
Route::middleware('auth:sanctum')->prefix('gestion/graduados')->group(function () {
    Route::get('/', [Controller::class, 'index'])->middleware('permiso:graduados.ver');
    Route::post('/', [Controller::class, 'store'])->middleware('permiso:graduados.crear');
    Route::put('/{id}', [Controller::class, 'update'])->middleware('permiso:graduados.editar');
    Route::delete('/{id}', [Controller::class, 'destroy'])->middleware('permiso:graduados.eliminar');
});

// CU-10: el graduado con cuenta (rol Usuario) registra y actualiza sus propios datos
Route::middleware('auth:sanctum')->prefix('mi-cuenta/graduado')->group(function () {
    Route::get('/', [Controller::class, 'miGraduado'])->middleware('permiso:mi_graduado.ver');
    Route::put('/', [Controller::class, 'guardarMiGraduado'])->middleware('permiso:mi_graduado.editar');
});
