<?php

namespace App\Modulos\MallaCurricular;

use App\Http\Controllers\Controller;

class MallaController extends Controller
{
    public function __construct(private MallaService $servicio) {}

    public function mostrar()
    {
        return $this->servicio->malla();
    }
}
