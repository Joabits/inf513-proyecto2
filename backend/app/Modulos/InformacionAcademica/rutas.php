<?php

use App\Modulos\InformacionAcademica\Controller;
use Illuminate\Support\Facades\Route;

// CU-16 Gestionar información académica
Route::get('/informacion-academica', [Controller::class, 'index']);

Route::middleware(['auth:sanctum', 'permiso:informacion_academica.editar'])
    ->put('/informacion-academica', [Controller::class, 'update']);
