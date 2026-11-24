<?php

namespace App\Modulos\Revista;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Presentación de la revista INNOVAR y normas para colaboradores: una sola fila. */
class Revista extends Model
{
    protected $table = 'revista';

    protected $fillable = ['presentacion', 'colaboradores'];

    /** Ediciones de la revista, las más recientes primero. */
    public function ediciones(): HasMany
    {
        return $this->hasMany(Edicion::class, 'revista_id')->recientes();
    }
}
