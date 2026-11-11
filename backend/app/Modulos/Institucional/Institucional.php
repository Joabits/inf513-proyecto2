<?php

namespace App\Modulos\Institucional;

use Illuminate\Database\Eloquent\Model;

/** Textos de «La Carrera»: una sola fila. */
class Institucional extends Model
{
    protected $table = 'institucional';

    protected $fillable = [
        'presentacion', 'resena_historica', 'mision', 'vision',
        'perfil_profesional', 'campo_ocupacional', 'fecha_creacion', 'resolucion', 'acreditacion',
    ];

    protected function casts(): array
    {
        return ['fecha_creacion' => 'date'];
    }
}
