<?php

namespace App\Modulos\Inicio;

use Illuminate\Foundation\Http\FormRequest;

class GuardarAccesosRequest extends FormRequest
{
    /** Ruta interna del portal (/malla-curricular) o enlace externo seguro. */
    public const ENLACE = '/^(\/(?!\/)|https:\/\/)/';

    public function rules(): array
    {
        return [
            'accesos' => ['present', 'array', 'max:8'],
            'accesos.*.titulo' => ['required', 'string', 'max:60'],
            'accesos.*.descripcion' => ['required', 'string', 'max:160'],
            'accesos.*.ruta' => ['required', 'string', 'max:200', 'regex:'.self::ENLACE],
        ];
    }

    public function attributes(): array
    {
        return [
            'accesos.*.titulo' => 'título',
            'accesos.*.descripcion' => 'descripción',
            'accesos.*.ruta' => 'enlace',
        ];
    }

    public function messages(): array
    {
        return ['accesos.*.ruta.regex' => 'El enlace debe empezar con / o con https://.'];
    }
}
