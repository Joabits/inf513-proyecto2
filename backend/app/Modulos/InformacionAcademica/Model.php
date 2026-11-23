<?php

namespace App\Modulos\InformacionAcademica;

use App\Models\User;
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

    public function autor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
