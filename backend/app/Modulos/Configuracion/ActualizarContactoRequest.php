<?php

namespace App\Modulos\Configuracion;

use Illuminate\Foundation\Http\FormRequest;

class ActualizarContactoRequest extends FormRequest
{
    private const OPCIONALES = ['referencia', 'telefono', 'whatsapp', 'correo', 'horario', 'mapa_url'];

    /** Quita espacios sobrantes y guarda vacío como null. El WhatsApp se guarda solo con números. */
    protected function prepareForValidation(): void
    {
        $limpio = [];

        foreach (['direccion', 'ciudad', ...self::OPCIONALES] as $campo) {
            $valor = $this->input($campo);
            if (is_string($valor)) {
                $valor = trim($valor);
                if ($campo === 'whatsapp') {
                    $valor = preg_replace('/[\s+().-]/', '', $valor);
                }
                $limpio[$campo] = $valor === '' && in_array($campo, self::OPCIONALES, true) ? null : $valor;
            }
        }

        $this->merge($limpio);
    }

    public function rules(): array
    {
        return [
            'direccion' => ['required', 'string', 'max:160'],
            'referencia' => ['nullable', 'string', 'max:160'],
            'ciudad' => ['required', 'string', 'max:80'],
            'telefono' => ['nullable', 'string', 'max:40', 'regex:/^\+?[0-9][0-9 ()-]{5,38}$/'],
            'whatsapp' => ['nullable', 'string', 'regex:/^[0-9]{8,15}$/'],
            'correo' => ['nullable', 'string', 'email', 'max:120'],
            'horario' => ['nullable', 'string', 'max:160'],
            'mapa_url' => ['nullable', 'string', 'max:500', 'url:https'],
        ];
    }

    public function attributes(): array
    {
        return [
            'direccion' => 'dirección',
            'telefono' => 'teléfono',
            'whatsapp' => 'WhatsApp',
            'correo' => 'correo electrónico',
            'horario' => 'horario de atención',
            'mapa_url' => 'enlace del mapa',
        ];
    }

    public function messages(): array
    {
        return [
            'telefono.regex' => 'Escriba un teléfono válido: números, espacios, guiones, paréntesis y el signo +.',
            'whatsapp.regex' => 'Escriba el número de WhatsApp con el código de país, por ejemplo 591 70000000.',
            'mapa_url.url' => 'El enlace del mapa debe ser una dirección web que empiece con https://.',
        ];
    }
}
