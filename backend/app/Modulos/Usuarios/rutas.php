<?php

use App\Modulos\Usuarios\PerfilController;
use App\Modulos\Usuarios\UsuariosController;
use Illuminate\Support\Facades\Route;

// CU-26 Gestionar usuarios: solo el rol con permisos "usuarios.*" (el Director de Carrera)
Route::middleware('auth:sanctum')->prefix('gestion/usuarios')->group(function () {
    Route::get('/', [UsuariosController::class, 'listar'])->middleware('permiso:usuarios.ver');
    Route::get('/roles', [UsuariosController::class, 'roles'])->middleware('permiso:usuarios.ver');
    Route::post('/', [UsuariosController::class, 'crear'])->middleware('permiso:usuarios.crear');
    Route::put('/{usuario}', [UsuariosController::class, 'actualizar'])->middleware('permiso:usuarios.editar');
    Route::patch('/{usuario}/estado', [UsuariosController::class, 'cambiarEstado'])->middleware('permiso:usuarios.editar');
    Route::put('/{usuario}/clave', [UsuariosController::class, 'cambiarClave'])->middleware('permiso:usuarios.editar');
    Route::delete('/{usuario}', [UsuariosController::class, 'eliminar'])->middleware('permiso:usuarios.eliminar');
});

// Mi perfil: cada cuenta con sesión (de cualquier rol) cambia su nombre, su correo y su contraseña
Route::middleware('auth:sanctum')->prefix('perfil')->group(function () {
    Route::put('/', [PerfilController::class, 'actualizar']);
    Route::put('/clave', [PerfilController::class, 'cambiarClave']);
});
