<?php

namespace App\Modulos\Galeria;

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
            $this->merge([
                'publicado' => filter_var($this->publicado, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false,
            ]);
        }
    }

    public function rules(): array
    {
        $esActualizacion = $this->route('id') !== null;

        return [
            'titulo' => 'nullable|string|max:255',
            'descripcion' => 'nullable|string',
            'imagen' => $esActualizacion ? 'nullable|image|max:2048' : 'required|image|max:2048',
            'publicado' => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'titulo.string' => 'El título debe ser una cadena de texto.',
            'titulo.max' => 'El título no puede tener más de 255 caracteres.',
            'descripcion.string' => 'La descripción debe ser una cadena de texto.',
            'imagen.required' => 'La imagen es obligatoria.',
            'imagen.image' => 'El archivo debe ser una imagen válida (jpg, jpeg, png, bmp, gif, svg o webp).',
            'imagen.max' => 'La imagen no debe pesar más de 2048 kilobytes (2 MB).',
            'publicado.boolean' => 'El estado publicado debe ser verdadero o falso.',
        ];
    }
}
