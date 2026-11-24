<?php

namespace App\Modulos\Graduados;

use Illuminate\Validation\Rule;

/**
 * CU-10: los mismos datos y mensajes que carga el personal. El CI no puede repetir el de otro graduado,
 * pero sí el propio al actualizar.
 */
class MiGraduadoRequest extends Request
{
    public function rules(): array
    {
        $propio = Model::where('cuenta_id', $this->user()->id)->value('id');

        return [
            ...parent::rules(),
            'ci' => ['required', 'string', 'max:20', Rule::unique('graduados', 'ci')->ignore($propio)],
        ];
    }
}
