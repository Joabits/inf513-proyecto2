<?php

namespace App\Modulos\Innova;

use Illuminate\Foundation\Http\FormRequest;

class GuardarServiciosRequest extends FormRequest
{
    public const MAXIMO = 12;

    public function rules(): array
    {
        return [
            'servicios' => ['present', 'array', 'max:'.self::MAXIMO],
            'servicios.*.nombre' => ['required', 'string', 'max:80', 'distinct:ignore_case'],
            'servicios.*.descripcion' => ['required', 'string', 'max:300'],
        ];
    }

    public function attributes(): array
    {
        return ['servicios.*.nombre' => 'nombre', 'servicios.*.descripcion' => 'descripción'];
    }

    public function messages(): array
    {
        return ['servicios.*.nombre.distinct' => 'Ya hay otro servicio con ese nombre.'];
    }
}
