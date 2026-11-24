<?php

namespace App\Modulos\Innova;

use App\Compartido\Modelos\PerteneceAContenidoUnico;
use Illuminate\Database\Eloquent\Model;

class ServicioInnova extends Model
{
    use PerteneceAContenidoUnico;

    public const CONTENIDO = ['innova_id', Innova::class];

    protected $table = 'innova_servicios';

    protected $fillable = ['nombre', 'descripcion', 'orden'];
}
