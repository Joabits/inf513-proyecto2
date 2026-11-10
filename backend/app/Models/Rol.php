<?php

namespace App\Models;

use App\Modulos\Menu\Menu;
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

    public function menus(): BelongsToMany
    {
        return $this->belongsToMany(Menu::class, 'rol_menu');
    }
}
