<?php

namespace App\Modulos\Docentes;

use Illuminate\Database\Eloquent\Model;

class Persona extends Model
{
    protected $table = 'personal_carrera';

    /** Grupo => nombre que ve el visitante, en el orden en que se muestran */
    public const GRUPOS = [
        'autoridad' => 'Autoridades',
        'administrativo' => 'Personal administrativo',
        'docente' => 'Personal docente',
    ];

    protected $fillable = ['nombre', 'cargo', 'grupo', 'foto', 'orden', 'visible', 'destacado'];

    protected function casts(): array
    {
        return ['visible' => 'boolean', 'destacado' => 'boolean', 'orden' => 'integer'];
    }
}
