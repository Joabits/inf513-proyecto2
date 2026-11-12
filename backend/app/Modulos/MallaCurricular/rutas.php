<?php

use App\Modulos\MallaCurricular\MallaController;
use Illuminate\Support\Facades\Route;

// CU-02 Consultar malla curricular (público). Los datos los administra CU-16.
Route::get('/malla-curricular', [MallaController::class, 'mostrar']);
