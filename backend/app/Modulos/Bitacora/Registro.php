<?php

namespace App\Modulos\Bitacora;

use Illuminate\Database\Eloquent\Model;

/**
 * Una fila de la bitácora, solo para consultarla. Se escribe únicamente con App\Compartido\Servicios\Bitacora
 * y con los triggers de PostgreSQL; en PostgreSQL la tabla no admite cambios ni borrados.
 */
class Registro extends Model
{
    protected $table = 'bitacora';

    public $timestamps = false;

    protected $guarded = ['*'];

    protected function casts(): array
    {
        return [
            'cambios' => 'array',
            'created_at' => 'datetime',
        ];
    }
}
