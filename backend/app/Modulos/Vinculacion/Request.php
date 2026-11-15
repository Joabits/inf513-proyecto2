<?php

namespace App\Modulos\Vinculacion;

use Illuminate\Foundation\Http\FormRequest;

class Request extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('publicado')) {
            $val = $this->input('publicado');
            if (is_string($val)) {
                $this->merge([
                    'publicado' => filter_var($val, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? $val,
                ]);
            }
        }
    }

    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:255'],
            'descripcion' => ['required', 'string'],
            'enlace' => ['nullable', 'url'],
            'imagen' => ['nullable', 'image', 'max:2048'],
            'publicado' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'titulo.required' => 'El título es obligatorio.',
            'titulo.string' => 'El título debe ser una cadena de texto.',
            'titulo.max' => 'El título no debe superar los 255 caracteres.',
            'descripcion.required' => 'La descripción es obligatoria.',
            'descripcion.string' => 'La descripción debe ser una cadena de texto.',
            'enlace.url' => 'El enlace debe tener un formato de URL válido.',
            'imagen.image' => 'El archivo debe ser una imagen válida.',
            'imagen.max' => 'La imagen no debe superar los 2048 kilobytes.',
            'publicado.boolean' => 'El campo publicado debe ser verdadero o falso.',
        ];
    }
}
