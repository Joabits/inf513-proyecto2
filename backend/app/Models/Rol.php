<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Rol extends Model
{
    public const DIRECTOR = 'director';
    public const EDITOR_INSTITUCIONAL = 'editor_institucional';
    public const EDITOR_COMUNICACION = 'editor_comunicacion';
    public const USUARIO = 'usuario';

    protected $table = 'roles';
    protected $fillable = ['slug', 'nombre', 'descripcion'];

    public function usuarios(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /** Fila de la matriz de acceso de este rol. */
    public function permisos(): BelongsToMany
    {
        return $this->belongsToMany(Permiso::class, 'rol_permiso');
    }
}
