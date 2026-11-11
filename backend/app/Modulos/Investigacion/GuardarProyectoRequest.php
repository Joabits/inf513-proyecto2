<?php

namespace App\Modulos\Investigacion;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GuardarProyectoRequest extends FormRequest
{
    /** Año de fundación de la Carrera: no hay proyectos anteriores. */
    public const PRIMERA_GESTION = 1970;

    protected function prepareForValidation(): void
    {
        $limpio = [];

        foreach (['titulo', 'responsable', 'integrantes', 'resumen'] as $campo) {
            $valor = $this->input($campo);
            if (is_string($valor)) {
                $valor = $campo === 'resumen'
                    ? trim(preg_replace("/\n{3,}/", "\n\n", str_replace(["\r\n", "\r"], "\n", $valor)))
                    : trim(preg_replace('/\s+/u', ' ', $valor));
                $limpio[$campo] = $valor === '' && $campo === 'integrantes' ? null : $valor;
            }
        }

        if ($this->input('linea_id') === '') {
            $limpio['linea_id'] = null;
        }

        $this->merge($limpio);
    }

    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'min:10', 'max:200'],
            'tipo' => ['required', 'string', Rule::in(array_keys(Proyecto::TIPOS))],
            'linea_id' => ['nullable', 'integer', 'exists:investigacion_lineas,id'],
            'responsable' => ['required', 'string', 'max:160'],
            'integrantes' => ['nullable', 'string', 'max:500'],
            'gestion' => ['required', 'integer', 'between:'.self::PRIMERA_GESTION.','.(now()->year + 1)],
            'estado' => ['required', 'string', Rule::in(array_keys(Proyecto::ESTADOS))],
            'resumen' => ['required', 'string', 'min:30', 'max:3000'],
            'publicado' => ['required', 'boolean'],
        ];
    }

    public function attributes(): array
    {
        return [
            'titulo' => 'título',
            'linea_id' => 'línea de investigación',
            'responsable' => 'docente responsable',
            'gestion' => 'gestión',
        ];
    }

    public function messages(): array
    {
        return [
            'tipo.in' => 'Elija un tipo de proyecto de la lista.',
            'estado.in' => 'Elija un estado de la lista.',
            'linea_id.exists' => 'Esa línea de investigación ya no existe. Elija otra.',
            'gestion.between' => 'Escriba un año entre '.self::PRIMERA_GESTION.' y '.(now()->year + 1).'.',
        ];
    }
}
