<?php

namespace App\Modulos\Inicio;

use App\Compartido\Modelos\PerteneceAContenidoUnico;
use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    use PerteneceAContenidoUnico;

    public const CONTENIDO = ['portada_id', Portada::class];

    protected $table = 'inicio_banners';

    protected $fillable = ['imagen', 'texto_alternativo', 'enlace', 'orden'];
}
