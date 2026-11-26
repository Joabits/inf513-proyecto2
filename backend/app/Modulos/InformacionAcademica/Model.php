<?php

namespace App\Modulos\InformacionAcademica;

use App\Models\User;
use App\Modulos\MallaCurricular\PlanEstudios;
use Illuminate\Database\Eloquent\Model as BaseModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Model extends BaseModel
{
    protected $table = 'informacion_academica';

    protected $fillable = [
        'mision',
        'vision',
        'perfil_profesional',
        'objetivos',
        'user_id',
    ];

    /** El plan de estudios cargado antes que esta sección queda enlazado a ella. */
    protected static function booted(): void
    {
        static::created(function (Model $informacion) {
            PlanEstudios::whereNull('informacion_academica_id')->update(['informacion_academica_id' => $informacion->id]);
        });
    }

    public function autor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
