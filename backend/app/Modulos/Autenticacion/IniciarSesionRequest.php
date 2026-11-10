<?php

namespace App\Modulos\Autenticacion;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class IniciarSesionRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        // PostgreSQL distingue mayúsculas: los correos se comparan siempre en minúsculas
        if (is_string($this->input('email'))) {
            $this->merge(['email' => Str::lower($this->input('email'))]);
        }
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email', 'max:255'],
            'password' => ['required', 'string', 'max:255'],
        ];
    }

    public function attributes(): array
    {
        return ['email' => 'correo electrónico', 'password' => 'contraseña'];
    }
}
