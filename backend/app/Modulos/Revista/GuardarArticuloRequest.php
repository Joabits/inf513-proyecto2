<?php

namespace App\Modulos\Revista;

use Illuminate\Foundation\Http\FormRequest;

/** Crear y editar un artículo. El PDF es opcional: hay artículos que solo se leen en el PDF de la edición. */
class GuardarArticuloRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:200'],
            'autores' => ['required', 'string', 'max:300'],
            'resumen' => ['nullable', 'string', 'max:3000'],
            'archivo' => ['nullable', 'file', 'mimes:pdf', 'extensions:pdf', 'max:'.GuardarEdicionRequest::MAXIMO_PDF_KB],
            'quitar_archivo' => ['nullable', 'boolean'],
        ];
    }

    public function attributes(): array
    {
        return ['titulo' => 'título', 'autores' => 'autores', 'resumen' => 'resumen', 'archivo' => 'archivo'];
    }

    public function messages(): array
    {
        return [
            'archivo.mimes' => 'El archivo del artículo debe ser un PDF.',
            'archivo.extensions' => 'El archivo del artículo debe ser un PDF.',
            'archivo.max' => 'El archivo no debe pesar más de 25 MB.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'titulo' => trim((string) $this->input('titulo')),
            'autores' => trim((string) $this->input('autores')),
            'resumen' => trim((string) $this->input('resumen')) ?: null,
        ]);
    }
}
