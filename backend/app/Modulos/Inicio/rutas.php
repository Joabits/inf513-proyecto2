<?php

use App\Modulos\Inicio\InicioController;
use Illuminate\Support\Facades\Route;

Route::get('/inicio', [InicioController::class, 'mostrar']);
