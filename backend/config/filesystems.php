<?php

/*
 * Solo se redefine el disco "public"; los demás discos vienen de Laravel.
 *
 * En tecnoweb el proyecto se sube por FTP y no se puede crear el enlace public/storage
 * (php artisan storage:link). Allí FILESYSTEM_PUBLIC_ROOT apunta el disco a una carpeta
 * que ya está dentro de la parte pública. Sin la variable (en local) todo queda como siempre.
 */
return [
    'disks' => [
        'public' => [
            'driver' => 'local',
            'root' => env('FILESYSTEM_PUBLIC_ROOT', storage_path('app/public')),
            'url' => rtrim((string) env('APP_URL'), '/').'/storage',
            'visibility' => 'public',
            'throw' => false,
            'report' => false,
        ],
    ],
];
