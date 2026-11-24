<?php

namespace App\Modulos\Configuracion;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Dirección, teléfonos, correo y horario de la Carrera: una sola fila. */
class DatosContacto extends Model
{
    protected $table = 'configuracion_contacto';

    protected $fillable = ['direccion', 'referencia', 'ciudad', 'telefono', 'whatsapp', 'correo', 'horario', 'mapa_url'];

    public function redes(): HasMany
    {
        return $this->hasMany(RedSocial::class, 'configuracion_id')->orderBy('orden');
    }

    public function enlaces(): HasMany
    {
        return $this->hasMany(EnlaceInteres::class, 'configuracion_id')->orderBy('orden');
    }
}
