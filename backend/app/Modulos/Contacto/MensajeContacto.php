<?php

namespace App\Modulos\Contacto;

use Illuminate\Database\Eloquent\Model;

/** Mensaje de un visitante (CU-08). El panel de mensajes (CU-25) cambia su estado. */
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
        'atendido',
        'respuesta',
        'atendido_en',
        'ip',
        'navegador',
    ];

    protected $attributes = [
        'estado' => self::NUEVO,
        'atendido' => false,
    ];

    protected $casts = [
        'atendido' => 'boolean',
        'atendido_en' => 'datetime',
    ];
}
