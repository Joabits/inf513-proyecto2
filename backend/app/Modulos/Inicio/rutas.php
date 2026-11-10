<?php

use App\Modulos\Inicio\InicioController;
use Illuminate\Support\Facades\Route;

Route::get('/inicio', [InicioController::class, 'mostrar']);

Route::middleware(['auth:sanctum', 'permiso:inicio.editar'])->prefix('inicio')->group(function () {
    Route::put('/portada', [InicioController::class, 'actualizarPortada']);
    Route::put('/cifras', [InicioController::class, 'guardarCifras']);
    Route::put('/accesos', [InicioController::class, 'guardarAccesos']);
    Route::post('/banners', [InicioController::class, 'agregarBanner']);
    Route::put('/banners/orden', [InicioController::class, 'ordenarBanners']);
    Route::delete('/banners/{banner}', [InicioController::class, 'eliminarBanner']);
    Route::post('/portada/foto', [InicioController::class, 'cambiarFotoDirector']);
    Route::delete('/portada/foto', [InicioController::class, 'quitarFotoDirector']);
});
