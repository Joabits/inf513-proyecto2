<?php

namespace App\Modulos\Revista;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Articulo extends Model
{
    protected $table = 'revista_articulos';

    protected $fillable = ['edicion_id', 'titulo', 'autores', 'resumen', 'archivo', 'archivo_nombre', 'archivo_tamano', 'orden'];

    public function edicion(): BelongsTo
    {
        return $this->belongsTo(Edicion::class, 'edicion_id');
    }
}
