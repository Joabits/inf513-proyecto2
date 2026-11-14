<?php

namespace App\Modulos\Docentes;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OrdenarPersonasRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'grupo' => ['required', 'string', Rule::in(array_keys(Persona::GRUPOS))],
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'distinct', Rule::exists('personal_carrera', 'id')->where('grupo', $this->input('grupo'))],
        ];
    }

    public function messages(): array
    {
        return ['ids.*.exists' => 'La lista tiene personas de otro grupo o que ya no existen. Recargue la página.'];
    }
}
