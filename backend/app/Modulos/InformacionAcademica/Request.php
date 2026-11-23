<?php

namespace App\Modulos\InformacionAcademica;

use Illuminate\Foundation\Http\FormRequest;

class Request extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'mision' => 'required|string',
            'vision' => 'required|string',
            'perfil_profesional' => 'required|string',
            'objetivos' => 'required|string',
        ];
    }

    public function messages(): array
    {
        return [
            'mision.required' => 'La misión es obligatoria.',
            'mision.string' => 'La misión debe ser un texto.',
            'vision.required' => 'La visión es obligatoria.',
            'vision.string' => 'La visión debe ser un texto.',
            'perfil_profesional.required' => 'El perfil profesional es obligatorio.',
            'perfil_profesional.string' => 'El perfil profesional debe ser un texto.',
            'objetivos.required' => 'Los objetivos son obligatorios.',
            'objetivos.string' => 'Los objetivos deben ser un texto.',
        ];
    }
}
