<?php

/*
 * Cada módulo declara sus rutas en app/Modulos/<Modulo>/rutas.php.
 * Aquí solo se cargan todas. Todas quedan con el prefijo /api.
 */
foreach (glob(app_path('Modulos/*/rutas.php')) as $rutasModulo) {
    if (basename(dirname($rutasModulo)) === 'Noticias') {
        continue;
    }
    require $rutasModulo;
}

require __DIR__.'/../app/Modulos/Noticias/rutas.php';
