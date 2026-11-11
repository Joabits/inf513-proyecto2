<?php

namespace App\Modulos\Investigacion;

use Illuminate\Database\Eloquent\Model;

/** Textos de semilleros, PIA e instituto vinculado: una sola fila. */
class ContenidoInvestigacion extends Model
{
    protected $table = 'investigacion_contenido';

    protected $fillable = [
        'semilleros_presentacion', 'semilleros_mision', 'semilleros_vision', 'semilleros_objetivos',
        'semilleros_coordinador', 'pia_presentacion', 'instituto',
    ];
}
