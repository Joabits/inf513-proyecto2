<?php

namespace App\Modulos\Investigacion;

use Illuminate\Foundation\Http\FormRequest;

class GuardarLineasRequest extends FormRequest
{
    public const MAXIMO = 20;

    public function rules(): array
    {
        return [
            'lineas' => ['present', 'array', 'max:'.self::MAXIMO],
            // Las líneas que ya existen traen su id; las nuevas, no
            'lineas.*.id' => ['nullable', 'integer', 'distinct', 'exists:investigacion_lineas,id'],
            'lineas.*.nombre' => ['required', 'string', 'max:160', 'distinct:ignore_case'],
            'lineas.*.descripcion' => ['required', 'string', 'max:1000'],
        ];
    }

    public function attributes(): array
    {
        return ['lineas.*.nombre' => 'nombre', 'lineas.*.descripcion' => 'descripción'];
    }

    public function messages(): array
    {
        return ['lineas.*.nombre.distinct' => 'Ya hay otra línea con ese nombre.'];
    }
}
