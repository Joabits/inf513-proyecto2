<?php

namespace App\Modulos\Innova;

use Illuminate\Foundation\Http\FormRequest;

class ActualizarInnovaRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $limpio = [];

        foreach (['presentacion', 'mision', 'vision', 'correo'] as $campo) {
            $valor = $this->input($campo);
            if (is_string($valor)) {
                $valor = trim(preg_replace("/\n{3,}/", "\n\n", str_replace(["\r\n", "\r"], "\n", $valor)));
                $limpio[$campo] = $valor === '' && $campo !== 'presentacion' ? null : $valor;
            }
        }

        $this->merge($limpio);
    }

    public function rules(): array
    {
        return [
            'presentacion' => ['required', 'string', 'min:20', 'max:2000'],
            'mision' => ['nullable', 'string', 'max:1000'],
            'vision' => ['nullable', 'string', 'max:1000'],
            'correo' => ['nullable', 'string', 'email', 'max:120'],
            'recibe_solicitudes' => ['required', 'boolean'],
        ];
    }

    public function attributes(): array
    {
        return [
            'presentacion' => 'presentación',
            'mision' => 'misión',
            'vision' => 'visión',
            'correo' => 'correo electrónico',
            'recibe_solicitudes' => 'recepción de solicitudes',
        ];
    }
}
