<?php

namespace App\Modulos\Inicio;

use Illuminate\Foundation\Http\FormRequest;

class GuardarCifrasRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'cifras' => ['present', 'array', 'max:8'],
            'cifras.*.valor' => ['required', 'string', 'max:20'],
            'cifras.*.etiqueta' => ['required', 'string', 'max:60'],
        ];
    }

    public function attributes(): array
    {
        return ['cifras.*.valor' => 'valor', 'cifras.*.etiqueta' => 'descripción'];
    }
}
