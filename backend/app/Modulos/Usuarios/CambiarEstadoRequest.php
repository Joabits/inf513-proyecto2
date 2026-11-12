<?php

namespace App\Modulos\Usuarios;

use Illuminate\Foundation\Http\FormRequest;

class CambiarEstadoRequest extends FormRequest
{
    public function rules(): array
    {
        return ['activo' => ['required', 'boolean']];
    }

    public function attributes(): array
    {
        return ['activo' => 'estado'];
    }
}
