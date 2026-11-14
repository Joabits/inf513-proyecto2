<?php

namespace App\Modulos\Revista;

use Illuminate\Database\Eloquent\Model;

/** Presentación de la revista INNOVAR y normas para colaboradores: una sola fila. */
class Revista extends Model
{
    protected $table = 'revista';

    protected $fillable = ['presentacion', 'colaboradores'];
}
