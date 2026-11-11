<?php

namespace App\Modulos\Documentos;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Documento extends Model
{
    protected $fillable = ['titulo', 'descripcion', 'categoria', 'archivo', 'nombre_original', 'tipo', 'tamano', 'publicado'];

    protected function casts(): array
    {
        return ['publicado' => 'boolean', 'tamano' => 'integer'];
    }

    public function versiones(): HasMany
    {
        return $this->hasMany(DocumentoVersion::class)->latest('id');
    }
}
