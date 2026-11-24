<?php

namespace App\Modulos\Docentes;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Ficha del personal de la Carrera (autoridades, administrativos y docentes). */
class Persona extends Model
{
    protected $table = 'personal_carrera';

    /** Grupo => nombre que ve el visitante, en el orden en que se muestran */
    public const GRUPOS = [
        'autoridad' => 'Autoridades',
        'administrativo' => 'Personal administrativo',
        'docente' => 'Personal docente',
    ];

    protected $fillable = ['nombre', 'cargo', 'grupo', 'foto', 'orden', 'visible', 'destacado', 'user_id'];

    /** Quién cargó la ficha no se muestra en el directorio público. */
    protected $hidden = ['user_id'];

    protected function casts(): array
    {
        return ['visible' => 'boolean', 'destacado' => 'boolean', 'orden' => 'integer'];
    }

    /** Cuenta del personal que cargó o editó la ficha por última vez. */
    public function autor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
