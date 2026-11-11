<?php

namespace App\Modulos\Innova;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Pedido de servicio a INNOVA (CU-09) y su seguimiento por el personal (CU-23). */
class SolicitudInnova extends Model
{
    public const PENDIENTE = 'pendiente';

    /** Estados y su nombre para mostrar. El orden es el del trabajo habitual. */
    public const ESTADOS = [
        'pendiente' => 'Pendiente',
        'en_revision' => 'En revisión',
        'aceptada' => 'Aceptada',
        'rechazada' => 'Rechazada',
        'finalizada' => 'Finalizada',
    ];

    protected $table = 'innova_solicitudes';

    protected $fillable = [
        'nombre', 'organizacion', 'correo', 'telefono', 'servicio', 'descripcion',
        'estado', 'respuesta', 'atendida_por', 'atendida_en', 'ip', 'navegador',
    ];

    protected $attributes = ['estado' => self::PENDIENTE];

    protected function casts(): array
    {
        return ['atendida_en' => 'datetime'];
    }

    public function atendente(): BelongsTo
    {
        return $this->belongsTo(User::class, 'atendida_por');
    }
}
