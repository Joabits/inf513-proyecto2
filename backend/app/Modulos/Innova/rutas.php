<?php

use App\Modulos\Innova\InnovaController;
use App\Modulos\Innova\SolicitudesInnovaController;
use Illuminate\Support\Facades\Route;

// CU-22 Gestionar Empresa Junior INNOVA (página pública y su edición)
Route::get('/innova', [InnovaController::class, 'mostrar']);

Route::middleware(['auth:sanctum', 'permiso:empresa_junior.editar'])->prefix('innova')->group(function () {
    Route::put('/contenido', [InnovaController::class, 'actualizarContenido']);
    Route::put('/servicios', [InnovaController::class, 'guardarServicios']);
});

// CU-09 Enviar solicitud a INNOVA: público, con límite de envíos por conexión (SolicitudesInnovaService)
Route::post('/innova/solicitudes', [SolicitudesInnovaController::class, 'enviar']);

// CU-23 Atender solicitudes de INNOVA
Route::middleware('auth:sanctum')->prefix('gestion/innova/solicitudes')->group(function () {
    Route::get('/', [SolicitudesInnovaController::class, 'listar'])->middleware('permiso:solicitudes_innova.ver');
    Route::patch('/{solicitud}', [SolicitudesInnovaController::class, 'atender'])->middleware('permiso:solicitudes_innova.editar');
});
