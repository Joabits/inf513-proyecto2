<?php

use App\Modulos\Docentes\DocentesController;
use Illuminate\Support\Facades\Route;

// CU-24 Gestionar autoridades y docentes (y su página pública)
Route::get('/docentes', [DocentesController::class, 'publica']);

Route::middleware('auth:sanctum')->prefix('gestion/docentes')->group(function () {
    Route::get('/', [DocentesController::class, 'gestion'])->middleware('permiso:docentes.ver');
    Route::post('/', [DocentesController::class, 'crear'])->middleware('permiso:docentes.crear');
    Route::put('/orden', [DocentesController::class, 'ordenar'])->middleware('permiso:docentes.editar');
    // Con foto, el formulario llega por POST con _method=PUT: PHP no lee archivos en un PUT
    Route::put('/{persona}', [DocentesController::class, 'actualizar'])->whereNumber('persona')->middleware('permiso:docentes.editar');
    Route::delete('/{persona}', [DocentesController::class, 'eliminar'])->whereNumber('persona')->middleware('permiso:docentes.eliminar');
});
