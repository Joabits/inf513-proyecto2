<?php

namespace App\Modulos\Inicio;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Portada extends Model
{
    protected $table = 'inicio_portada';

    protected $fillable = [
        'distintivo', 'titulo', 'presentacion', 'director_nombre', 'director_cargo', 'director_mensaje', 'director_foto',
    ];

    public function banners(): HasMany
    {
        return $this->hasMany(Banner::class, 'portada_id')->orderBy('orden');
    }

    public function accesos(): HasMany
    {
        return $this->hasMany(Acceso::class, 'portada_id')->orderBy('orden');
    }

    public function cifras(): HasMany
    {
        return $this->hasMany(Cifra::class, 'portada_id')->orderBy('orden');
    }
}
