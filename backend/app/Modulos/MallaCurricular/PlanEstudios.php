<?php

namespace App\Modulos\MallaCurricular;

use App\Modulos\InformacionAcademica\Model as InformacionAcademica;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Datos generales del plan de estudios vigente: una sola fila. Es parte de la información académica, que lo
 * muestra en su página; al crearlo se enlaza solo a esa fila si ya existe (si no, la enlaza la información
 * académica cuando se guarda por primera vez).
 */
class PlanEstudios extends Model
{
    protected $table = 'malla_plan';

    protected $fillable = ['codigo', 'nivel', 'sistema', 'semestres', 'titulaciones', 'nota_graduacion'];

    protected function casts(): array
    {
        return ['semestres' => 'integer'];
    }

    protected static function booted(): void
    {
        static::creating(function (PlanEstudios $plan) {
            $plan->informacion_academica_id ??= InformacionAcademica::query()->orderBy('id')->value('id');
        });
    }

    public function informacionAcademica(): BelongsTo
    {
        return $this->belongsTo(InformacionAcademica::class, 'informacion_academica_id');
    }

    /** Materias del plan, por semestre. */
    public function materias(): HasMany
    {
        return $this->hasMany(Materia::class, 'plan_id')->orderBy('semestre')->orderBy('orden');
    }
}
