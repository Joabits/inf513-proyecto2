<?php

namespace App\Modulos\Documentos;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Archivo que tuvo un documento antes de ser reemplazado. */
class DocumentoVersion extends Model
{
    protected $table = 'documento_versiones';

    protected $fillable = ['archivo', 'nombre_original', 'tipo', 'tamano'];

    protected function casts(): array
    {
        return ['tamano' => 'integer'];
    }

    public function documento(): BelongsTo
    {
        return $this->belongsTo(Documento::class);
    }
}
