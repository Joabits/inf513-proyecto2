<?php

namespace App\Modulos\Inicio;

class InicioService
{
    public function contenido(): array
    {
        return [
            'portada' => Portada::first(),
            'banners' => Banner::orderBy('orden')->get(),
            'cifras' => Cifra::orderBy('orden')->get(),
            'accesos' => Acceso::orderBy('orden')->get(),
        ];
    }
}
