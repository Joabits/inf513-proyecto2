<?php

use App\Modulos\Documentos\DocumentosController;
use Illuminate\Support\Facades\Route;

Route::get('/documentos/{documento}/descargar', [DocumentosController::class, 'descargarPublico']);

Route::middleware('auth:sanctum')->prefix('gestion/documentos')->group(function () {
    Route::get('/', [DocumentosController::class, 'listar'])->middleware('permiso:documentos.ver');
    Route::get('/categorias', [DocumentosController::class, 'categorias'])->middleware('permiso:documentos.ver');
    Route::post('/categorias', [DocumentosController::class, 'crearCategoria'])->middleware('permiso:documentos.crear');
    Route::post('/', [DocumentosController::class, 'crear'])->middleware('permiso:documentos.crear');
    // Con archivo, el formulario llega por POST con _method=PUT: PHP no lee archivos en un PUT
    Route::put('/{documento}', [DocumentosController::class, 'actualizar'])->middleware('permiso:documentos.editar');
    Route::delete('/{documento}', [DocumentosController::class, 'eliminar'])->middleware('permiso:documentos.eliminar');
    Route::get('/{documento}/versiones', [DocumentosController::class, 'versiones'])->middleware('permiso:documentos.ver');
    Route::get('/{documento}/descargar', [DocumentosController::class, 'descargar'])->middleware('permiso:documentos.ver');
    Route::get('/{documento}/versiones/{version}/descargar', [DocumentosController::class, 'descargarVersion'])->middleware('permiso:documentos.ver');
});
