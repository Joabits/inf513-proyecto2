<?php

namespace App\Modulos\Visitas;

use Illuminate\Foundation\Http\FormRequest;

class RegistrarVisitaRequest extends FormRequest
{
    public function rules(): array
    {
        return ['pagina' => ['required', 'string', 'max:150', 'starts_with:/']];
    }

    public function attributes(): array
    {
        return ['pagina' => 'página'];
    }
}
