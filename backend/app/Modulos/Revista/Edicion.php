<?php

namespace App\Modulos\Revista;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Edicion extends Model
{
    protected $table = 'revista_ediciones';

    protected $fillable = ['volumen', 'numero', 'anio', 'titulo', 'descripcion', 'portada', 'archivo', 'archivo_nombre', 'archivo_tamano', 'publicada', 'user_id'];

    protected function casts(): array
    {
        return ['publicada' => 'boolean', 'volumen' => 'integer', 'numero' => 'integer', 'anio' => 'integer'];
    }

    public function articulos(): HasMany
    {
        return $this->hasMany(Articulo::class, 'edicion_id')->orderBy('orden')->orderBy('id');
    }

    public function autor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /** Las más recientes primero. */
    public function scopeRecientes(Builder $consulta): Builder
    {
        return $consulta->orderByDesc('anio')->orderByDesc('numero')->orderByDesc('id');
    }

    /** «Volumen 2 · Número 3 · 2026» (el volumen es opcional). */
    public function nombre(): string
    {
        return collect([$this->volumen ? "Volumen {$this->volumen}" : null, "Número {$this->numero}", $this->anio])->filter()->implode(' · ');
    }
}
