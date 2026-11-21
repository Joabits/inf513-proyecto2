<?php

namespace App\Modulos\Graduados;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class Request extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id') ?? $this->route('graduado');

        return [
            'nombre_completo' => ['required', 'string', 'max:255'],
            'ci' => ['required', 'string', 'max:20', Rule::unique('graduados', 'ci')->ignore($id)],
            'correo' => ['nullable', 'email'],
            'telefono' => ['nullable', 'string', 'max:20'],
            'gestion_ingreso' => ['required', 'string'],
            'gestion_egreso' => ['required', 'string'],
            'modalidad' => ['required', 'string'],
            'titulo_tema' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre_completo.required' => 'El nombre completo es obligatorio.',
            'nombre_completo.string' => 'El nombre completo debe ser una cadena de texto.',
            'nombre_completo.max' => 'El nombre completo no debe superar los 255 caracteres.',
            'ci.required' => 'El CI es obligatorio.',
            'ci.string' => 'El CI debe ser una cadena de texto.',
            'ci.max' => 'El CI no debe superar los 20 caracteres.',
            'ci.unique' => 'Ya existe un graduado registrado con ese CI.',
            'correo.email' => 'El correo electrónico debe tener un formato válido.',
            'telefono.max' => 'El teléfono no debe superar los 20 caracteres.',
            'gestion_ingreso.required' => 'La gestión de ingreso es obligatoria.',
            'gestion_egreso.required' => 'La gestión de egreso es obligatoria.',
            'modalidad.required' => 'La modalidad de graduación es obligatoria.',
        ];
    }
}
