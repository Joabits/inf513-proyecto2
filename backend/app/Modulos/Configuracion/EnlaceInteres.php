<?php

namespace App\Modulos\Configuracion;

use Illuminate\Database\Eloquent\Model;

/** Enlaces de interés del pie de página (UAGRM, Facultad, Inscripciones...). */
class EnlaceInteres extends Model
{
    protected $table = 'configuracion_enlaces';

    protected $fillable = ['titulo', 'url', 'orden'];
}
