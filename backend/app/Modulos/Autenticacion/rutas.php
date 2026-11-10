<?php

use App\Modulos\Autenticacion\AutenticacionController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AutenticacionController::class, 'login']);
Route::post('/logout', [AutenticacionController::class, 'logout'])->middleware('auth:sanctum');
