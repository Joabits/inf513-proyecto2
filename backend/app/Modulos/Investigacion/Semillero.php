<?php

namespace App\Modulos\Investigacion;

use Illuminate\Database\Eloquent\Model;

/** Área de los semilleros de investigación (por ejemplo, «Semillero de Marketing y Comercio»). */
class Semillero extends Model
{
    protected $table = 'investigacion_semilleros';

    protected $fillable = ['nombre', 'descripcion', 'orden'];
}
