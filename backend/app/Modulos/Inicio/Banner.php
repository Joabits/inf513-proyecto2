<?php

namespace App\Modulos\Inicio;

use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    protected $table = 'inicio_banners';

    protected $fillable = ['imagen', 'texto_alternativo', 'enlace', 'orden'];
}
