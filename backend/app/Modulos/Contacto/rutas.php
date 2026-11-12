<?php

use App\Modulos\Contacto\ContactoController;
use Illuminate\Support\Facades\Route;

// CU-08 Enviar mensaje de contacto: público, con límite de envíos por conexión (ContactoService)
Route::post('/contacto', [ContactoController::class, 'enviar']);
