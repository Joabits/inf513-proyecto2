<?php

namespace App\Modulos\Noticias;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model as EloquentModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Model extends EloquentModel
{
    use HasFactory;

    protected $table = 'noticias';

    protected $fillable = [
        'titulo',
        'resumen',
        'contenido',
        'imagen',
        'publicada',
        'publicada_en',
        'user_id',
    ];

    protected $casts = [
        'publicada' => 'boolean',
        'publicada_en' => 'datetime',
    ];

    public function autor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
