<?php

namespace App\Modulos\Graduados;

use App\Modulos\Usuarios\CambiarClaveRequest;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * CU-10: un graduado solicita su cuenta desde el portal. Son sus datos de graduado más el correo (con el que
 * ingresará, no puede ser el de otra cuenta) y la contraseña, con las mismas reglas que las demás cuentas.
 */
class SolicitudCuentaRequest extends FormRequest
{
    /** Campo trampa, como en el formulario de contacto: oculto para las personas; si llega con texto es un programa. */
    public const TRAMPA = 'sitio_web';

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $limpio = [];
        foreach (['nombre_completo', 'ci', 'correo', 'telefono', 'gestion_ingreso', 'gestion_egreso', 'modalidad', 'titulo_tema'] as $campo) {
            $valor = $this->input($campo);
            if (is_string($valor)) {
                $valor = trim($valor);
                $limpio[$campo] = match ($campo) {
                    'correo' => Str::lower($valor),
                    'nombre_completo' => preg_replace('/\s+/u', ' ', $valor),
                    'telefono', 'titulo_tema' => $valor === '' ? null : $valor,
                    default => $valor,
                };
            }
        }
        $this->merge($limpio);
    }

    public function rules(): array
    {
        return [
            'nombre_completo' => ['required', 'string', 'min:3', 'max:255'],
            'ci' => ['required', 'string', 'max:20', Rule::unique('graduados', 'ci')],
            'correo' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')],
            'telefono' => ['nullable', 'string', 'max:20'],
            'gestion_ingreso' => ['required', 'string', 'max:50'],
            'gestion_egreso' => ['required', 'string', 'max:50'],
            'modalidad' => ['required', 'string', 'max:100'],
            'titulo_tema' => ['nullable', 'string', 'max:500'],
            'password' => ['required', 'string', 'max:255', 'confirmed', ...CambiarClaveRequest::reglasClave()],
            self::TRAMPA => ['nullable'],
        ];
    }

    public function attributes(): array
    {
        return ['correo' => 'correo electrónico', 'password' => 'contraseña', 'ci' => 'CI'];
    }

    public function messages(): array
    {
        return [
            'nombre_completo.required' => 'Escriba su nombre completo.',
            'nombre_completo.min' => 'Escriba su nombre completo.',
            'ci.required' => 'Escriba su carnet de identidad.',
            'ci.unique' => 'Ya hay un graduado registrado con ese CI. Si es usted, consulte en la Dirección de Carrera.',
            'correo.required' => 'Escriba su correo electrónico: con él ingresará al portal.',
            'correo.email' => 'Escriba un correo electrónico válido, por ejemplo nombre@gmail.com.',
            'correo.unique' => 'Ya hay una cuenta con ese correo. Si es suya, ingrese con su contraseña.',
            'gestion_ingreso.required' => 'Escriba su gestión de ingreso, por ejemplo I-2018.',
            'gestion_egreso.required' => 'Escriba su gestión de egreso, por ejemplo II-2023.',
            'modalidad.required' => 'Elija su modalidad de graduación.',
            'password.required' => 'Escriba una contraseña.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
        ];
    }

    /** Lo llenó un programa: se responde igual, pero no se crea nada. */
    public function esAutomatico(): bool
    {
        return filled($this->input(self::TRAMPA));
    }
}
