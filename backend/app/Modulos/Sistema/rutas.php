<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Prueba de punta a punta: React -> API -> respuesta
Route::get('/ping', fn () => [
    'mensaje' => 'API del Portal de Administración de Empresas funcionando',
    'hora_servidor' => now()->format('d/m/Y H:i:s'),
]);

// Usuario con sesión iniciada (o null) y sus permisos. React lo usa para el header, el menú y las rutas protegidas.
Route::get('/sesion', function (Request $request) {
    $usuario = $request->user('sanctum')?->load('rol');

    return ['usuario' => $usuario ? [
        'id' => $usuario->id,
        'nombre' => $usuario->name,
        'email' => $usuario->email,
        'rol' => $usuario->rol ? ['slug' => $usuario->rol->slug, 'nombre' => $usuario->rol->nombre] : null,
        'permisos' => $usuario->permisos(),
    ] : null];
});
