<?php

namespace App\Modulos\Innova;

use Illuminate\Database\Eloquent\Model;

/** Presentación de la Empresa Junior INNOVA: una sola fila. */
class Innova extends Model
{
    protected $table = 'innova';

    protected $fillable = ['presentacion', 'mision', 'vision', 'correo', 'recibe_solicitudes'];

    protected $attributes = ['recibe_solicitudes' => true];

    protected function casts(): array
    {
        return ['recibe_solicitudes' => 'boolean'];
    }

    /** Si todavía no hay fila, la Empresa Junior recibe solicitudes. */
    public static function recibeSolicitudes(): bool
    {
        return self::query()->value('recibe_solicitudes') ?? true;
    }
}
