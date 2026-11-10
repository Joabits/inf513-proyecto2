<?php

use App\Modulos\Visitas\VisitaController;
use Illuminate\Support\Facades\Route;

// El footer de React llama a esta ruta cada vez que cambia de página
Route::post('/visitas', [VisitaController::class, 'store'])->middleware('throttle:120,1');
