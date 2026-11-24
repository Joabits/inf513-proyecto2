<?php

namespace App\Modulos\Inicio;

use App\Compartido\Modelos\PerteneceAContenidoUnico;
use Illuminate\Database\Eloquent\Model;

class Acceso extends Model
{
    use PerteneceAContenidoUnico;

    public const CONTENIDO = ['portada_id', Portada::class];

    protected $table = 'inicio_accesos';

    protected $fillable = ['titulo', 'descripcion', 'ruta', 'orden'];
}
