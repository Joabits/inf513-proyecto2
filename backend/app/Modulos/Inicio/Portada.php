<?php

namespace App\Modulos\Inicio;

use Illuminate\Database\Eloquent\Model;

class Portada extends Model
{
    protected $table = 'inicio_portada';

    protected $fillable = [
        'distintivo', 'titulo', 'presentacion', 'director_nombre', 'director_cargo', 'director_mensaje', 'director_foto',
    ];
}
