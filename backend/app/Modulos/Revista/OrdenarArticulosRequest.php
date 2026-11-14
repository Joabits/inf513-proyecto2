<?php

namespace App\Modulos\Revista;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OrdenarArticulosRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'distinct', Rule::exists('revista_articulos', 'id')->where('edicion_id', $this->route('edicion')->id)],
        ];
    }

    public function messages(): array
    {
        return ['ids.*.exists' => 'La lista tiene artículos de otra edición o que ya no existen. Recargue la página.'];
    }
}
