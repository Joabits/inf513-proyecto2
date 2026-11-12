<?php

namespace App\Modulos\MallaCurricular;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Materia extends Model
{
    protected $table = 'malla_materias';

    protected $fillable = ['sigla', 'nombre', 'semestre', 'horas_teoricas', 'horas_practicas', 'creditos', 'optativa', 'orden'];

    protected function casts(): array
    {
        return [
            'semestre' => 'integer',
            'horas_teoricas' => 'integer',
            'horas_practicas' => 'integer',
            'creditos' => 'integer',
            'optativa' => 'boolean',
        ];
    }

    /** Materias que hay que aprobar antes de cursar esta. */
    public function prerrequisitos(): BelongsToMany
    {
        return $this->belongsToMany(self::class, 'malla_prerrequisitos', 'materia_id', 'prerrequisito_id');
    }
}
