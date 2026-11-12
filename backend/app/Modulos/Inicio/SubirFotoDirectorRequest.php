<?php

namespace App\Modulos\Inicio;

use Illuminate\Foundation\Http\FormRequest;

class SubirFotoDirectorRequest extends FormRequest
{
    public function rules(): array
    {
        return ['foto' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048']];
    }

    public function attributes(): array
    {
        return ['foto' => 'fotografía'];
    }

    public function messages(): array
    {
        return ['foto.max' => 'La fotografía no debe pesar más de 2 MB.'];
    }
}
