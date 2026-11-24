<?php

namespace App\Modulos\Investigacion;

use App\Compartido\Modelos\PerteneceAContenidoUnico;
use Illuminate\Database\Eloquent\Model;

/** Área de los semilleros de investigación (por ejemplo, «Semillero de Marketing y Comercio»). */
class Semillero extends Model
{
    use PerteneceAContenidoUnico;

    public const CONTENIDO = ['contenido_id', ContenidoInvestigacion::class];

    protected $table = 'investigacion_semilleros';

    protected $fillable = ['nombre', 'descripcion', 'orden'];
}
