<?php

use App\Modulos\Eventos\Controller as EventosController;
use Illuminate\Support\Facades\Route;

Route::get('/eventos', [EventosController::class, 'index']);
Route::get('/eventos/{id}', [EventosController::class, 'show']);

Route::middleware(['auth:sanctum', 'permiso:eventos.crear'])->post('/eventos', [EventosController::class, 'store']);
Route::middleware(['auth:sanctum', 'permiso:eventos.editar'])->put('/eventos/{id}', [EventosController::class, 'update']);
Route::middleware(['auth:sanctum', 'permiso:eventos.eliminar'])->delete('/eventos/{id}', [EventosController::class, 'destroy']);
