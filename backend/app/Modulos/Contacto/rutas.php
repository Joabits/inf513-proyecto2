<?php

use App\Modulos\Contacto\ContactoController;
use App\Modulos\Contacto\Controller as ContactoGestionController;
use Illuminate\Support\Facades\Route;

// CU-08 Enviar mensaje de contacto: público, con límite de envíos por conexión (ContactoService)
Route::post('/contacto', [ContactoController::class, 'enviar']);

// CU-25 Atender mensajes de contacto (panel de gestión)
Route::middleware(['auth:sanctum', 'permiso:contacto.ver'])->group(function () {
    Route::get('/contacto/mensajes', [ContactoGestionController::class, 'index']);
    Route::get('/mensajes', [ContactoGestionController::class, 'index']);
});

Route::middleware(['auth:sanctum', 'permiso:contacto.editar'])->group(function () {
    Route::put('/contacto/mensajes/{id}', [ContactoGestionController::class, 'update']);
    Route::patch('/contacto/mensajes/{id}', [ContactoGestionController::class, 'update']);
    Route::put('/mensajes/{id}', [ContactoGestionController::class, 'update']);
    Route::patch('/mensajes/{id}', [ContactoGestionController::class, 'update']);
});

Route::middleware(['auth:sanctum', 'permiso:contacto.eliminar'])->group(function () {
    Route::delete('/contacto/mensajes/{id}', [ContactoGestionController::class, 'destroy']);
    Route::delete('/mensajes/{id}', [ContactoGestionController::class, 'destroy']);
});
