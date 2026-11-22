<?php

namespace App\Modulos\Eventos;

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
            'titulo' => ['required', 'string', 'max:255'],
            'descripcion' => ['required', 'string'],
            'fecha_inicio' => ['required', 'date'],
            'fecha_fin' => ['required', 'date', 'after_or_equal:fecha_inicio'],
            'lugar' => ['required', 'string', 'max:255'],
            'enlace' => ['nullable', 'url'],
            'publicado' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'titulo.required' => 'El título es obligatorio.',
            'titulo.string' => 'El título debe ser un texto válido.',
            'titulo.max' => 'El título no puede tener más de 255 caracteres.',
            'descripcion.required' => 'La descripción es obligatoria.',
            'descripcion.string' => 'La descripción debe ser un texto válido.',
            'fecha_inicio.required' => 'La fecha de inicio es obligatoria.',
            'fecha_inicio.date' => 'La fecha de inicio debe ser una fecha válida.',
            'fecha_fin.required' => 'La fecha de fin es obligatoria.',
            'fecha_fin.date' => 'La fecha de fin debe ser una fecha válida.',
            'fecha_fin.after_or_equal' => 'La fecha de fin debe ser igual o posterior a la fecha de inicio.',
            'lugar.required' => 'El lugar es obligatorio.',
            'lugar.string' => 'El lugar debe ser un texto válido.',
            'lugar.max' => 'El lugar no puede tener más de 255 caracteres.',
            'enlace.url' => 'El enlace debe ser una URL válida.',
            'publicado.boolean' => 'El campo publicado debe ser verdadero o falso.',
        ];
    }
}
