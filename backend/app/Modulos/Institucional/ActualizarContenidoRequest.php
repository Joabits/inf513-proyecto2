<?php

namespace App\Modulos\Institucional;

use Illuminate\Foundation\Http\FormRequest;

class ActualizarContenidoRequest extends FormRequest
{
    /** Límites de cada texto. Igual en el formulario de React (institucional.esquema.ts). */
    public const LIMITES = [
        'presentacion' => 1000,
        'resena_historica' => 5000,
        'mision' => 1000,
        'vision' => 1000,
        'perfil_profesional' => 3000,
        'campo_ocupacional' => 3000,
    ];

    /**
     * Normaliza los saltos de línea y deja como máximo una línea en blanco entre párrafos.
     * Los campos opcionales vacíos se guardan como null.
     */
    protected function prepareForValidation(): void
    {
        $limpio = [];

        foreach (array_keys(self::LIMITES) as $campo) {
            $valor = $this->input($campo);
            if (is_string($valor)) {
                $valor = str_replace(["\r\n", "\r"], "\n", $valor);
                $limpio[$campo] = trim(preg_replace("/\n{3,}/", "\n\n", $valor));
            }
        }

        foreach (['fecha_creacion', 'resolucion', 'acreditacion'] as $campo) {
            $valor = $this->input($campo);
            if (is_string($valor)) {
                $limpio[$campo] = trim($valor) === '' ? null : trim($valor);
            }
        }

        $this->merge($limpio);
    }

    public function rules(): array
    {
        $reglas = [];

        foreach (self::LIMITES as $campo => $maximo) {
            $reglas[$campo] = ['required', 'string', 'min:20', 'max:'.$maximo];
        }

        return [
            ...$reglas,
            'fecha_creacion' => ['nullable', 'date_format:Y-m-d', 'before_or_equal:today'],
            'resolucion' => ['nullable', 'string', 'max:120'],
            'acreditacion' => ['nullable', 'string', 'max:160'],
        ];
    }

    public function attributes(): array
    {
        return [
            'presentacion' => 'presentación',
            'resena_historica' => 'reseña histórica',
            'mision' => 'misión',
            'vision' => 'visión',
            'perfil_profesional' => 'perfil profesional',
            'campo_ocupacional' => 'campo ocupacional',
            'fecha_creacion' => 'fecha de creación',
            'resolucion' => 'resolución',
            'acreditacion' => 'acreditación',
        ];
    }

    public function messages(): array
    {
        return [
            'fecha_creacion.before_or_equal' => 'La fecha de creación no puede ser posterior a hoy.',
            'fecha_creacion.date_format' => 'Elija una fecha válida.',
        ];
    }
}
