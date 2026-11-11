<?php

namespace App\Modulos\MallaCurricular;

use Illuminate\Database\Eloquent\Model;

/** Datos generales del plan de estudios vigente: una sola fila. */
class PlanEstudios extends Model
{
    protected $table = 'malla_plan';

    protected $fillable = ['codigo', 'nivel', 'sistema', 'semestres', 'titulaciones', 'nota_graduacion'];

    protected function casts(): array
    {
        return ['semestres' => 'integer'];
    }
}
