<?php

namespace App\Modulos\MallaCurricular;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Datos generales del plan de estudios vigente: una sola fila. */
class PlanEstudios extends Model
{
    protected $table = 'malla_plan';

    protected $fillable = ['codigo', 'nivel', 'sistema', 'semestres', 'titulaciones', 'nota_graduacion'];

    protected function casts(): array
    {
        return ['semestres' => 'integer'];
    }

    /** Materias del plan, por semestre. */
    public function materias(): HasMany
    {
        return $this->hasMany(Materia::class, 'plan_id')->orderBy('semestre')->orderBy('orden');
    }
}
