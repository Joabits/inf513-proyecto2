<?php

namespace App\Modulos\Inicio;

use Illuminate\Database\Eloquent\Model;

class Acceso extends Model
{
    protected $table = 'inicio_accesos';

    protected $fillable = ['titulo', 'descripcion', 'ruta', 'orden'];
}
