<?php

namespace App\Modulos\Institucional;

use Illuminate\Foundation\Http\FormRequest;

class GuardarHitosRequest extends FormRequest
{
    public const MAXIMO = 12;

    /** Año más antiguo aceptado: la Universidad se fundó en 1880. */
    public const PRIMER_ANIO = 1880;

    public function rules(): array
    {
        return [
            'hitos' => ['present', 'array', 'max:'.self::MAXIMO],
            'hitos.*.anio' => ['required', 'integer', 'between:'.self::PRIMER_ANIO.','.now()->year],
            'hitos.*.titulo' => ['required', 'string', 'max:120'],
            'hitos.*.descripcion' => ['nullable', 'string', 'max:300'],
        ];
    }

    public function attributes(): array
    {
        return ['hitos.*.anio' => 'año', 'hitos.*.titulo' => 'título', 'hitos.*.descripcion' => 'descripción'];
    }

    public function messages(): array
    {
        return ['hitos.*.anio.between' => 'Escriba un año entre '.self::PRIMER_ANIO.' y '.now()->year.'.'];
    }
}
