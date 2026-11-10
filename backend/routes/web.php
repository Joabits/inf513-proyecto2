<?php

use Illuminate\Support\Facades\Route;

/*
 * En producción React se compila en public/spa (npm run build en ../frontend).
 * Cualquier ruta que no sea /api la atiende la aplicación React.
 */
Route::get('/{ruta?}', function () {
    $indice = public_path('spa/index.html');

    abort_unless(is_file($indice), 404, 'Falta compilar el frontend: cd frontend && npm run build');

    return response()->file($indice);
})->where('ruta', '^(?!api|sanctum|up).*$');
