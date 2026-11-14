<?php

namespace App\Modulos\Busqueda;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BuscarRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'q' => ['required', 'string', 'min:3', 'max:80'],
            'tipo' => ['nullable', 'string', Rule::in(app(BusquedaService::class)->tipos())],
        ];
    }

    public function messages(): array
    {
        return [
            'q.required' => 'Escriba qué desea buscar.',
            'q.min' => 'Escriba al menos 3 caracteres.',
            'q.max' => 'La búsqueda no debe pasar de 80 caracteres.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['q' => preg_replace('/\s+/u', ' ', trim((string) $this->input('q')))]);
    }
}
