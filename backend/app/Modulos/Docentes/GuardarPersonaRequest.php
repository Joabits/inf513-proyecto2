<?php

namespace App\Modulos\Docentes;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Crear y editar. La foto es opcional; al editar, «quitar_foto» la borra sin subir otra. */
class GuardarPersonaRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:160'],
            'cargo' => ['required', 'string', 'max:160'],
            'grupo' => ['required', 'string', Rule::in(array_keys(Persona::GRUPOS))],
            'visible' => ['required', 'boolean'],
            'destacado' => ['required', 'boolean'],
            'foto' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096', 'dimensions:min_width=300,min_height=300'],
            'quitar_foto' => ['nullable', 'boolean'],
        ];
    }

    public function attributes(): array
    {
        return ['foto' => 'fotografía'];
    }

    public function messages(): array
    {
        return [
            'foto.image' => 'La fotografía debe ser una imagen JPG, PNG o WebP.',
            'foto.mimes' => 'La fotografía debe ser una imagen JPG, PNG o WebP.',
            'foto.max' => 'La fotografía no debe pesar más de 4 MB.',
            'foto.dimensions' => 'La fotografía debe medir al menos 300 × 300 píxeles.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'nombre' => trim((string) $this->input('nombre')),
            'cargo' => trim((string) $this->input('cargo')),
        ]);
    }
}
