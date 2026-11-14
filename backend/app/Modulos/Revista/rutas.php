<?php

use App\Modulos\Revista\RevistaController;
use Illuminate\Support\Facades\Route;

// CU-21 Gestionar INNOVAR: la revista pública, sus descargas y su edición en el panel
Route::get('/revista', [RevistaController::class, 'publica']);
Route::get('/revista/ediciones/{edicion}/archivo', [RevistaController::class, 'descargarEdicionPublica'])->whereNumber('edicion');
Route::get('/revista/articulos/{articulo}/archivo', [RevistaController::class, 'descargarArticuloPublico'])->whereNumber('articulo');

Route::middleware('auth:sanctum')->prefix('gestion/revista')->group(function () {
    Route::get('/', [RevistaController::class, 'gestion'])->middleware('permiso:revista.ver');
    Route::put('/contenido', [RevistaController::class, 'actualizarContenido'])->middleware('permiso:revista.editar');

    Route::post('/ediciones', [RevistaController::class, 'crearEdicion'])->middleware('permiso:revista.crear');
    // Con archivos, el formulario llega por POST con _method=PUT: PHP no lee archivos en un PUT
    Route::put('/ediciones/{edicion}', [RevistaController::class, 'actualizarEdicion'])->whereNumber('edicion')->middleware('permiso:revista.editar');
    Route::patch('/ediciones/{edicion}/publicacion', [RevistaController::class, 'cambiarPublicacion'])->whereNumber('edicion')->middleware('permiso:revista.editar');
    Route::delete('/ediciones/{edicion}', [RevistaController::class, 'eliminarEdicion'])->whereNumber('edicion')->middleware('permiso:revista.eliminar');
    Route::get('/ediciones/{edicion}/archivo', [RevistaController::class, 'descargarEdicion'])->whereNumber('edicion')->middleware('permiso:revista.ver');

    Route::post('/ediciones/{edicion}/articulos', [RevistaController::class, 'crearArticulo'])->whereNumber('edicion')->middleware('permiso:revista.crear');
    Route::put('/ediciones/{edicion}/articulos/orden', [RevistaController::class, 'ordenarArticulos'])->whereNumber('edicion')->middleware('permiso:revista.editar');
    Route::put('/articulos/{articulo}', [RevistaController::class, 'actualizarArticulo'])->whereNumber('articulo')->middleware('permiso:revista.editar');
    Route::delete('/articulos/{articulo}', [RevistaController::class, 'eliminarArticulo'])->whereNumber('articulo')->middleware('permiso:revista.eliminar');
    Route::get('/articulos/{articulo}/archivo', [RevistaController::class, 'descargarArticulo'])->whereNumber('articulo')->middleware('permiso:revista.ver');
});
