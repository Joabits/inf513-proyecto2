<?php

namespace App\Modulos\Revista;

use Illuminate\Foundation\Http\FormRequest;

class ActualizarContenidoRevistaRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $limpio = [];

        foreach (['presentacion', 'colaboradores'] as $campo) {
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
            'colaboradores' => ['nullable', 'string', 'max:4000'],
        ];
    }

    public function attributes(): array
    {
        return ['presentacion' => 'presentación', 'colaboradores' => 'información para colaboradores'];
    }
}
