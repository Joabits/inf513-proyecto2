<?php

namespace App\Modulos\Documentos;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Documento extends Model
{
    protected $fillable = ['titulo', 'descripcion', 'categoria_id', 'archivo', 'nombre_original', 'tipo', 'mime', 'tamano', 'publicado', 'user_id'];

    protected function casts(): array
    {
        return ['publicado' => 'boolean', 'tamano' => 'integer'];
    }

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class);
    }

    /** Quién subió el archivo vigente. */
    public function autor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function versiones(): HasMany
    {
        return $this->hasMany(DocumentoVersion::class)->latest('id');
    }
}
