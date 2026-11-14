<?php

use App\Modulos\Busqueda\BusquedaController;
use Illuminate\Support\Facades\Route;

// CU-07 Buscar en el portal: público, con límite de consultas por conexión
Route::get('/buscar', [BusquedaController::class, 'buscar'])->middleware('throttle:30,1');
