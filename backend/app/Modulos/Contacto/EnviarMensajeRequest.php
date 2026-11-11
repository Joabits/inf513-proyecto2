<?php

namespace App\Modulos\Contacto;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class EnviarMensajeRequest extends FormRequest
{
    /**
     * Campo trampa: está oculto para las personas, pero los programas que llenan
     * formularios automáticamente lo completan. Si llega con texto, el mensaje se descarta.
     */
    public const TRAMPA = 'sitio_web';

    protected function prepareForValidation(): void
    {
        $limpio = [];

        foreach (['nombre', 'correo', 'telefono', 'asunto', 'mensaje'] as $campo) {
            $valor = $this->input($campo);
            if (is_string($valor)) {
                $valor = trim($valor);
                $limpio[$campo] = match ($campo) {
                    'correo' => Str::lower($valor),
                    'telefono' => $valor === '' ? null : $valor,
                    'nombre', 'asunto' => preg_replace('/\s+/u', ' ', $valor),
                    default => $valor,
                };
            }
        }

        $this->merge($limpio);
    }

    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'min:3', 'max:120'],
            'correo' => ['required', 'string', 'email', 'max:120'],
            'telefono' => ['nullable', 'string', 'max:40', 'regex:/^\+?[0-9][0-9 ()-]{5,38}$/'],
            'asunto' => ['required', 'string', 'min:3', 'max:120'],
            'mensaje' => ['required', 'string', 'min:10', 'max:2000'],
            self::TRAMPA => ['nullable'],
        ];
    }

    public function attributes(): array
    {
        return ['correo' => 'correo electrónico', 'telefono' => 'teléfono'];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'Escriba su nombre.',
            'correo.required' => 'Escriba su correo electrónico para poder responderle.',
            'correo.email' => 'Escriba un correo electrónico válido, por ejemplo nombre@gmail.com.',
            'telefono.regex' => 'Escriba un teléfono válido: números, espacios, guiones, paréntesis y el signo +.',
            'asunto.required' => 'Escriba el asunto de su mensaje.',
            'mensaje.required' => 'Escriba su mensaje.',
            'mensaje.min' => 'Cuéntenos un poco más: el mensaje debe tener al menos 10 caracteres.',
        ];
    }

    /** ¿Lo envió un programa automático? */
    public function esAutomatico(): bool
    {
        return filled($this->input(self::TRAMPA));
    }
}
