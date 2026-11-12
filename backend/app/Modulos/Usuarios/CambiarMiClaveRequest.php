<?php

namespace App\Modulos\Usuarios;

use Illuminate\Foundation\Http\FormRequest;

/** «Mi perfil»: la persona cambia su propia contraseña escribiendo primero la actual. */
class CambiarMiClaveRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'clave_actual' => ['required', 'string', 'current_password'],
            'password' => ['required', 'string', 'max:255', 'confirmed', 'different:clave_actual', ...CambiarClaveRequest::reglasClave()],
        ];
    }

    public function attributes(): array
    {
        return ['clave_actual' => 'contraseña actual', 'password' => 'contraseña nueva'];
    }
}
