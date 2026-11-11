<?php

namespace App\Modulos\Investigacion;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Proyecto extends Model
{
    public const TIPOS = [
        'investigacion' => 'Proyecto de investigación',
        'aula' => 'Proyecto de Investigación en Aula (PIA)',
        'semillero' => 'Proyecto de semillero',
    ];

    public const ESTADOS = ['en_curso' => 'En curso', 'concluido' => 'Concluido'];

    protected $table = 'investigacion_proyectos';

    protected $fillable = ['titulo', 'tipo', 'linea_id', 'responsable', 'integrantes', 'gestion', 'estado', 'resumen', 'publicado', 'user_id'];

    protected function casts(): array
    {
        return ['publicado' => 'boolean', 'gestion' => 'integer', 'linea_id' => 'integer'];
    }

    public function linea(): BelongsTo
    {
        return $this->belongsTo(Linea::class);
    }

    /** Quién lo registró o lo editó por última vez. */
    public function autor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
