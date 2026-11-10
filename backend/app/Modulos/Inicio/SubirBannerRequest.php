<?php

namespace App\Modulos\Inicio;

use Illuminate\Foundation\Http\FormRequest;

class SubirBannerRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'imagen' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096', 'dimensions:min_width=1200,min_height=400'],
            'texto_alternativo' => ['required', 'string', 'max:200'],
            'enlace' => ['nullable', 'string', 'max:200', 'regex:'.GuardarAccesosRequest::ENLACE],
        ];
    }

    public function attributes(): array
    {
        return ['texto_alternativo' => 'descripción de la imagen', 'enlace' => 'enlace'];
    }

    public function messages(): array
    {
        return [
            'imagen.dimensions' => 'La imagen debe medir al menos 1200 × 400 píxeles.',
            'imagen.max' => 'La imagen no debe pesar más de 4 MB.',
            'enlace.regex' => 'El enlace debe empezar con / o con https://.',
        ];
    }
}
