<?php

namespace App\Modulos\Usuarios;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class CambiarClaveRequest extends FormRequest
{
    /** Igual en el formulario de React (usuarios.esquema.ts): si cambia aquí, cambia allá. */
    public static function reglasClave(): array
    {
        return [Password::min(8)->letters()->numbers()];
    }

    public function rules(): array
    {
        return ['password' => ['required', 'string', 'max:255', 'confirmed', ...self::reglasClave()]];
    }

    public function attributes(): array
    {
        return ['password' => 'contraseña'];
    }
}
