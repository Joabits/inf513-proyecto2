<?php

namespace App\Modulos\Usuarios;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * Crear y editar una cuenta. Al editar no se toca la contraseña:
 * tiene su propia acción (CambiarClaveRequest).
 */
class GuardarUsuarioRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $nombre = $this->input('nombre');
        $email = $this->input('email');

        // PostgreSQL distingue mayúsculas: los correos se guardan siempre en minúsculas.
        // Lo que no sea texto se deja igual para que la regla "string" lo rechace.
        $this->merge([
            'nombre' => is_string($nombre) ? preg_replace('/\s+/u', ' ', trim($nombre)) : $nombre,
            'email' => is_string($email) ? Str::lower(trim($email)) : $email,
        ]);
    }

    public function rules(): array
    {
        $usuario = $this->route('usuario');

        $reglas = [
            'nombre' => ['required', 'string', 'min:3', 'max:120'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($usuario)],
            'rol_id' => ['required', 'integer', 'exists:roles,id'],
        ];

        if ($usuario === null) {
            $reglas['password'] = ['required', 'string', 'max:255', 'confirmed', ...CambiarClaveRequest::reglasClave()];
            $reglas['activo'] = ['sometimes', 'boolean'];
        }

        return $reglas;
    }

    public function attributes(): array
    {
        return ['nombre' => 'nombre', 'email' => 'correo electrónico', 'rol_id' => 'rol', 'password' => 'contraseña'];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'Ya existe una cuenta con ese correo electrónico.',
            'rol_id.required' => 'Elija un rol.',
            'rol_id.exists' => 'El rol elegido no existe.',
        ];
    }
}
