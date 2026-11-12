<?php

namespace App\Modulos\Investigacion;

use Illuminate\Foundation\Http\FormRequest;

/** Textos de semilleros, PIA e instituto, y la lista de áreas de los semilleros. */
class GuardarComplementosRequest extends FormRequest
{
    public const TEXTOS = [
        'semilleros_presentacion' => 2000,
        'semilleros_mision' => 1000,
        'semilleros_vision' => 1000,
        'semilleros_objetivos' => 2000,
        'semilleros_coordinador' => 160,
        'pia_presentacion' => 2000,
        'instituto' => 1000,
    ];

    public const MAXIMO_SEMILLEROS = 12;

    protected function prepareForValidation(): void
    {
        $limpio = [];

        foreach (array_keys(self::TEXTOS) as $campo) {
            $valor = $this->input($campo);
            if (is_string($valor)) {
                $valor = trim(preg_replace("/\n{3,}/", "\n\n", str_replace(["\r\n", "\r"], "\n", $valor)));
                $limpio[$campo] = $valor === '' ? null : $valor;
            }
        }

        $this->merge($limpio);
    }

    public function rules(): array
    {
        $reglas = [];

        foreach (self::TEXTOS as $campo => $maximo) {
            $reglas[$campo] = ['nullable', 'string', 'max:'.$maximo];
        }

        return [
            ...$reglas,
            'semilleros' => ['present', 'array', 'max:'.self::MAXIMO_SEMILLEROS],
            'semilleros.*.nombre' => ['required', 'string', 'max:120', 'distinct:ignore_case'],
            'semilleros.*.descripcion' => ['nullable', 'string', 'max:300'],
        ];
    }

    public function attributes(): array
    {
        return [
            'semilleros_presentacion' => 'presentación de los semilleros',
            'semilleros_mision' => 'misión de los semilleros',
            'semilleros_vision' => 'visión de los semilleros',
            'semilleros_objetivos' => 'objetivos de los semilleros',
            'semilleros_coordinador' => 'coordinador de semilleros',
            'pia_presentacion' => 'presentación de los PIA',
            'instituto' => 'instituto vinculado',
            'semilleros.*.nombre' => 'nombre',
            'semilleros.*.descripcion' => 'descripción',
        ];
    }

    public function messages(): array
    {
        return ['semilleros.*.nombre.distinct' => 'Ya hay otro semillero con ese nombre.'];
    }
}
