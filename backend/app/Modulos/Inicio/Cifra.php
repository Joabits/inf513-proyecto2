<?php

namespace App\Modulos\Inicio;

use App\Compartido\Modelos\PerteneceAContenidoUnico;
use Illuminate\Database\Eloquent\Model;

class Cifra extends Model
{
    use PerteneceAContenidoUnico;

    public const CONTENIDO = ['portada_id', Portada::class];

    protected $table = 'inicio_cifras';

    protected $fillable = ['valor', 'etiqueta', 'orden'];
}
