<?php

namespace App\Modulos\Innova;

use Illuminate\Database\Eloquent\Model;

class ServicioInnova extends Model
{
    protected $table = 'innova_servicios';

    protected $fillable = ['nombre', 'descripcion', 'orden'];
}
