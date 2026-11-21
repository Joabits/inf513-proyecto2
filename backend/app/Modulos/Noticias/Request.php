<?php

namespace App\Modulos\Noticias;

use Illuminate\Foundation\Http\FormRequest;

class Request extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('publicada')) {
            $this->merge([
                'publicada' => filter_var($this->publicada, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false,
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:255'],
            'resumen' => ['required', 'string', 'max:500'],
            'contenido' => ['required', 'string'],
            'imagen' => ['nullable', 'image', 'max:2048'],
            'publicada' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'titulo.required' => 'El título es obligatorio.',
            'titulo.string' => 'El título debe ser una cadena de texto.',
            'titulo.max' => 'El título no puede superar los 255 caracteres.',
            'resumen.required' => 'El resumen es obligatorio.',
            'resumen.string' => 'El resumen debe ser una cadena de texto.',
            'resumen.max' => 'El resumen no puede superar los 500 caracteres.',
            'contenido.required' => 'El contenido es obligatorio.',
            'contenido.string' => 'El contenido debe ser una cadena de texto.',
            'imagen.image' => 'El archivo debe ser una imagen válida.',
            'imagen.max' => 'La imagen no debe pesar más de 2MB.',
            'publicada.boolean' => 'El estado de publicación debe ser un valor booleano.',
        ];
    }
}
