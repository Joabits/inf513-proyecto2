<?php

namespace App\Modulos\Investigacion;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Linea extends Model
{
    protected $table = 'investigacion_lineas';

    protected $fillable = ['nombre', 'descripcion', 'orden'];

    public function proyectos(): HasMany
    {
        return $this->hasMany(Proyecto::class);
    }
}
