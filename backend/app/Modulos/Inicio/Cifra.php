<?php

namespace App\Modulos\Inicio;

use Illuminate\Database\Eloquent\Model;

class Cifra extends Model
{
    protected $table = 'inicio_cifras';

    protected $fillable = ['valor', 'etiqueta', 'orden'];
}
