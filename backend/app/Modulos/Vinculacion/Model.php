<?php

namespace App\Modulos\Vinculacion;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model as EloquentModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Model extends EloquentModel
{
    use HasFactory;

    protected $table = 'vinculaciones';

    protected $fillable = [
        'titulo',
        'descripcion',
        'enlace',
        'imagen',
        'publicado',
        'user_id',
    ];

    protected function casts(): array
    {
        return [
            'publicado' => 'boolean',
        ];
    }

    public function autor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

if (! class_exists('App\Modulos\Vinculacion\Vinculacion', false)) {
    class_alias(Model::class, 'App\Modulos\Vinculacion\Vinculacion');
}
