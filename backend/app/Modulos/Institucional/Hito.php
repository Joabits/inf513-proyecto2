<?php

namespace App\Modulos\Institucional;

use App\Compartido\Modelos\PerteneceAContenidoUnico;
use Illuminate\Database\Eloquent\Model;

/** Un momento de la historia de la Carrera para la línea de tiempo. */
class Hito extends Model
{
    use PerteneceAContenidoUnico;

    public const CONTENIDO = ['institucional_id', Institucional::class];

    protected $table = 'institucional_hitos';

    protected $fillable = ['anio', 'titulo', 'descripcion', 'orden'];

    protected function casts(): array
    {
        return ['anio' => 'integer'];
    }
}
