<?php

/*
 * Solo se escriben las opciones que cambian respecto de Laravel.
 * Todo lo demás (base de datos, sesión, caché...) se configura en .env.
 */
return [
    'timezone' => env('APP_TIMEZONE', 'America/La_Paz'),
];
