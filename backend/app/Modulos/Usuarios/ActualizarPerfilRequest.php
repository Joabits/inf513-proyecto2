<?php

namespace App\Modulos\Usuarios;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * «Mi perfil»: la persona cambia su nombre o su correo. El correo es con el que ingresa,
 * así que cambiarlo exige la contraseña actual (si alguien deja la sesión abierta, otro no puede quedarse con la cuenta).
 */
class ActualizarPerfilRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $nombre = $this->input('nombre');
        $email = $this->input('email');

        // Igual que GuardarUsuarioRequest: espacios de más fuera y correos siempre en minúsculas
        $this->merge([
            'nombre' => is_string($nombre) ? preg_replace('/\s+/u', ' ', trim($nombre)) : $nombre,
            'email' => is_string($email) ? Str::lower(trim($email)) : $email,
        ]);
    }

    public function rules(): array
    {
        $usuario = $this->user();

        $reglas = [
            'nombre' => ['required', 'string', 'min:3', 'max:120'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($usuario)],
        ];

        if ($this->input('email') !== $usuario->email) {
            $reglas['clave_actual'] = ['required', 'string', 'current_password'];
        }

        return $reglas;
    }

    public function attributes(): array
    {
        return ['nombre' => 'nombre', 'email' => 'correo electrónico', 'clave_actual' => 'contraseña actual'];
    }
}
