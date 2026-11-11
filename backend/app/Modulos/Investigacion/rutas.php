<?php

use App\Modulos\Investigacion\InvestigacionController;
use Illuminate\Support\Facades\Route;

// Público: lo consume la página de CU-03 Consultar investigación
Route::get('/investigacion', [InvestigacionController::class, 'publica']);

// CU-19 Gestionar investigación
Route::middleware('auth:sanctum')->prefix('gestion/investigacion')->group(function () {
    Route::get('/', [InvestigacionController::class, 'gestion'])->middleware('permiso:investigacion.ver');

    Route::post('/proyectos', [InvestigacionController::class, 'crearProyecto'])->middleware('permiso:investigacion.crear');
    Route::put('/proyectos/{proyecto}', [InvestigacionController::class, 'actualizarProyecto'])->middleware('permiso:investigacion.editar');
    Route::patch('/proyectos/{proyecto}/publicacion', [InvestigacionController::class, 'cambiarPublicacion'])->middleware('permiso:investigacion.editar');
    Route::delete('/proyectos/{proyecto}', [InvestigacionController::class, 'eliminarProyecto'])->middleware('permiso:investigacion.eliminar');

    Route::put('/lineas', [InvestigacionController::class, 'guardarLineas'])->middleware('permiso:investigacion.editar');
    Route::put('/complementos', [InvestigacionController::class, 'guardarComplementos'])->middleware('permiso:investigacion.editar');
});
