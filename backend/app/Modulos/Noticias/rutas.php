<?php

use App\Modulos\Noticias\Controller;
use Illuminate\Support\Facades\Route;

Route::get('/noticias', [Controller::class, 'index']);
Route::get('/noticias/{id}', [Controller::class, 'show']);

Route::middleware(['auth:sanctum', 'permiso:noticias.crear'])->post('/noticias', [Controller::class, 'store']);
Route::middleware(['auth:sanctum', 'permiso:noticias.editar'])->post('/noticias/{id}', [Controller::class, 'update']);
Route::middleware(['auth:sanctum', 'permiso:noticias.eliminar'])->delete('/noticias/{id}', [Controller::class, 'destroy']);
