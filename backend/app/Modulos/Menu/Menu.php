<?php

namespace App\Modulos\Menu;

use App\Models\Permiso;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Menu extends Model
{
    protected $fillable = ['parent_id', 'permiso_id', 'titulo', 'ruta', 'seccion', 'orden', 'activo'];
    protected $casts = ['activo' => 'boolean'];

    public function hijos(): HasMany
    {
        return $this->hasMany(Menu::class, 'parent_id')->where('activo', true)->orderBy('orden');
    }

    public function permiso(): BelongsTo
    {
        return $this->belongsTo(Permiso::class);
    }
}
