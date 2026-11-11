<?php

namespace App\Modulos\Innova;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class AtenderSolicitudRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $respuesta = $this->input('respuesta');

        if (is_string($respuesta)) {
            $this->merge(['respuesta' => trim($respuesta) === '' ? null : trim($respuesta)]);
        }
    }

    public function rules(): array
    {
        return [
            'estado' => ['required', 'string', Rule::in(array_keys(SolicitudInnova::ESTADOS))],
            'respuesta' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function attributes(): array
    {
        return ['respuesta' => 'nota de seguimiento'];
    }

    public function messages(): array
    {
        return ['estado.in' => 'Elija un estado de la lista.'];
    }

    /** Rechazar sin explicar el motivo deja a la persona sin respuesta: se pide la nota. */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($this->input('estado') === 'rechazada' && blank($this->input('respuesta'))) {
                    $validator->errors()->add('respuesta', 'Escriba el motivo del rechazo para poder comunicarlo.');
                }
            },
        ];
    }
}
