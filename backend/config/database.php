<?php

/*
 * Solo se redefine la conexión PostgreSQL para poder elegir el ESQUEMA:
 * en el servidor de la materia cada grupo trabaja en su esquema asignado (DB_SCHEMA).
 * Las demás conexiones usan los valores por defecto de Laravel.
 */
return [
    'connections' => [
        'pgsql' => [
            'driver' => 'pgsql',
            'url' => env('DB_URL'),
            'host' => env('DB_HOST', '127.0.0.1'),
            'port' => env('DB_PORT', '5432'),
            'database' => env('DB_DATABASE', 'cae_portal'),
            'username' => env('DB_USERNAME', 'postgres'),
            'password' => env('DB_PASSWORD', ''),
            'charset' => 'utf8',
            'prefix' => '',
            'prefix_indexes' => true,
            'search_path' => env('DB_SCHEMA', 'public'),
            'sslmode' => env('DB_SSLMODE', 'prefer'),
            // La sesión usa la zona de la aplicación: así las horas que pone la base (triggers, DEFAULT CURRENT_TIMESTAMP)
            // coinciden con las de now() en Laravel. Sin esto, la bitácora mezclaría horas UTC y de La Paz.
            'timezone' => env('APP_TIMEZONE', 'America/La_Paz'),
        ],
    ],
];
