<?php

namespace App\Modulos\Bitacora;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FiltrarBitacoraRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'grupo' => ['nullable', 'string', Rule::in(array_keys(BitacoraService::GRUPOS))],
            'usuario' => ['nullable', 'string', 'max:255'],
            'accion' => ['nullable', 'string', 'max:40'],
            'texto' => ['nullable', 'string', 'max:100'],
            'desde' => ['nullable', 'date_format:Y-m-d'],
            'hasta' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:desde'],
            'resultado' => ['nullable', 'string', Rule::in(array_keys(BitacoraService::RESULTADOS))],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'desde.date_format' => 'Elija una fecha válida.',
            'hasta.date_format' => 'Elija una fecha válida.',
            'hasta.after_or_equal' => 'La fecha final no puede ser anterior a la inicial.',
        ];
    }

    /** Los filtros con valor, sin la página. */
    public function filtros(): array
    {
        return array_filter($this->safe()->except('page'), fn ($valor) => $valor !== null && $valor !== '');
    }
}
