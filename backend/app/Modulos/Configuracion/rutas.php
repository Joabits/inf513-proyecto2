<?php

use App\Modulos\Configuracion\ConfiguracionController;
use Illuminate\Support\Facades\Route;

// CU-28 Configurar datos de contacto y enlaces
Route::get('/configuracion', [ConfiguracionController::class, 'mostrar']);

Route::middleware(['auth:sanctum', 'permiso:configuracion.editar'])->prefix('configuracion')->group(function () {
    Route::put('/contacto', [ConfiguracionController::class, 'actualizarContacto']);
    Route::put('/redes', [ConfiguracionController::class, 'guardarRedes']);
    Route::put('/enlaces', [ConfiguracionController::class, 'guardarEnlaces']);
});
