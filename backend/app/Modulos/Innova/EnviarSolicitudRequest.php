<?php

namespace App\Modulos\Innova;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class EnviarSolicitudRequest extends FormRequest
{
    /** Campo trampa para programas automáticos (igual que en el formulario de contacto). */
    public const TRAMPA = 'sitio_web';

    protected function prepareForValidation(): void
    {
        $limpio = [];

        foreach (['nombre', 'organizacion', 'correo', 'telefono', 'descripcion'] as $campo) {
            $valor = $this->input($campo);
            if (is_string($valor)) {
                $valor = trim($valor);
                $limpio[$campo] = match ($campo) {
                    'correo' => Str::lower($valor),
                    'organizacion', 'telefono' => $valor === '' ? null : preg_replace('/\s+/u', ' ', $valor),
                    'nombre' => preg_replace('/\s+/u', ' ', $valor),
                    default => $valor,
                };
            }
        }

        // «Otro / no estoy seguro» llega vacío
        if ($this->input('servicio_id') === '') {
            $limpio['servicio_id'] = null;
        }

        $this->merge($limpio);
    }

    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'min:3', 'max:120'],
            'organizacion' => ['nullable', 'string', 'max:160'],
            'correo' => ['required', 'string', 'email', 'max:120'],
            'telefono' => ['nullable', 'string', 'max:40', 'regex:/^\+?[0-9][0-9 ()-]{5,38}$/'],
            'servicio_id' => ['nullable', 'integer', 'exists:innova_servicios,id'],
            'descripcion' => ['required', 'string', 'min:20', 'max:2000'],
            self::TRAMPA => ['nullable'],
        ];
    }

    public function attributes(): array
    {
        return [
            'organizacion' => 'empresa u organización',
            'correo' => 'correo electrónico',
            'telefono' => 'teléfono',
            'servicio_id' => 'servicio',
            'descripcion' => 'descripción',
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'Escriba su nombre.',
            'correo.required' => 'Escriba su correo electrónico para poder responderle.',
            'correo.email' => 'Escriba un correo electrónico válido, por ejemplo nombre@gmail.com.',
            'telefono.regex' => 'Escriba un teléfono válido: números, espacios, guiones, paréntesis y el signo +.',
            'servicio_id.exists' => 'Ese servicio ya no está disponible. Elija otro de la lista.',
            'descripcion.required' => 'Cuéntenos qué necesita.',
            'descripcion.min' => 'Describa un poco más lo que necesita (al menos 20 caracteres).',
        ];
    }

    public function esAutomatico(): bool
    {
        return filled($this->input(self::TRAMPA));
    }
}
