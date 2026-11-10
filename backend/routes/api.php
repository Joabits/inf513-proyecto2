<?php

/*
 * Cada módulo declara sus rutas en app/Modulos/<Modulo>/rutas.php.
 * Aquí solo se cargan todas. Todas quedan con el prefijo /api.
 */
foreach (glob(app_path('Modulos/*/rutas.php')) as $rutasModulo) {
    require $rutasModulo;
}
