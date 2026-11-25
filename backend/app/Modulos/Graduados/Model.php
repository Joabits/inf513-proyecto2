<?php

namespace App\Modulos\Graduados;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model as EloquentModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Model extends EloquentModel
{
    use HasFactory;

    protected $table = 'graduados';

    protected $fillable = [
        'nombre_completo',
        'ci',
        'correo',
        'telefono',
        'gestion_ingreso',
        'gestion_egreso',
        'modalidad',
        'titulo_tema',
        'user_id',
        'cuenta_id',
    ];

    public function autor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /** CU-10: la cuenta del propio graduado (rol Usuario), si tiene. */
    public function cuenta(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cuenta_id');
    }

    /** Solicitó su cuenta desde el portal y la Carrera todavía no la aprobó (o la cuenta está desactivada). */
    public function cuentaPendiente(): bool
    {
        return $this->cuenta !== null && ! $this->cuenta->activo;
    }
}
