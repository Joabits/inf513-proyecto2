<?php

namespace App\Modulos\Contacto;

use App\Models\User;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Mensaje de un visitante (CU-08). El panel de mensajes (CU-25) cambia su estado y guarda
 * quién lo atendió y cuándo.
 */
class MensajeContacto extends Model
{
    public const NUEVO = 'nuevo';

    public const ATENDIDO = 'atendido';

    protected $table = 'mensajes_contacto';

    protected $fillable = [
        'nombre',
        'correo',
        'telefono',
        'asunto',
        'mensaje',
        'estado',
        'respuesta',
        'atendido_por',
        'atendido_en',
        'ip',
        'navegador',
    ];

    protected $attributes = [
        'estado' => self::NUEVO,
    ];

    protected $casts = [
        'atendido_en' => 'datetime',
    ];

    /** El panel lee «atendido» en el JSON: ya no es columna, se calcula desde el estado. */
    protected $appends = ['atendido'];

    public function atendidoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'atendido_por');
    }

    protected function atendido(): Attribute
    {
        return Attribute::get(fn () => $this->estado === self::ATENDIDO);
    }
}
