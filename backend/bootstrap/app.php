<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        health: '/up',
    )
    ->withCommands([
        // Cuenta del Director en el servidor: allí el seeder no crea usuarios de prueba
        \App\Modulos\Usuarios\CrearDirectorCommand::class,
    ])
    ->withMiddleware(function (Middleware $middleware): void {
        // React y Laravel comparten dominio: sesión por cookie con Sanctum
        $middleware->statefulApi();

        // Autor de los cambios para los triggers de auditoría y registro de recursos accedidos
        $middleware->appendToGroup('api', [
            \App\Compartido\Middleware\EstablecerUsuarioBD::class,
            \App\Compartido\Middleware\RegistrarAcceso::class,
        ]);

        // Matriz de acceso: ->middleware('permiso:noticias.crear')
        $middleware->alias([
            'permiso' => \App\Compartido\Middleware\VerificarPermiso::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
