<?php

namespace App\Modulos\Documentos;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Archivo que tuvo un documento antes de ser reemplazado. */
class DocumentoVersion extends Model
{
    protected $table = 'documento_versiones';

    protected $fillable = ['archivo', 'nombre_original', 'tipo', 'mime', 'tamano', 'user_id'];

    protected function casts(): array
    {
        return ['tamano' => 'integer'];
    }

    public function documento(): BelongsTo
    {
        return $this->belongsTo(Documento::class);
    }

    /** Quién había subido ese archivo. */
    public function autor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
