<?php

namespace App\Modulos\Configuracion;

use Illuminate\Database\Eloquent\Model;

/** Dirección, teléfonos, correo y horario de la Carrera: una sola fila. */
class DatosContacto extends Model
{
    protected $table = 'configuracion_contacto';

    protected $fillable = ['direccion', 'referencia', 'ciudad', 'telefono', 'whatsapp', 'correo', 'horario', 'mapa_url'];
}
