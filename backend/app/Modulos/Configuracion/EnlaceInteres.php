<?php

namespace App\Modulos\Configuracion;

use App\Compartido\Modelos\PerteneceAContenidoUnico;
use Illuminate\Database\Eloquent\Model;

/** Enlaces de interés del pie de página (UAGRM, Facultad, Inscripciones...). */
class EnlaceInteres extends Model
{
    use PerteneceAContenidoUnico;

    public const CONTENIDO = ['configuracion_id', DatosContacto::class];

    protected $table = 'configuracion_enlaces';

    protected $fillable = ['titulo', 'url', 'orden'];
}
