<?php

namespace App\Modulos\Documentos;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class CrearCategoriaRequest extends FormRequest
{
    public function rules(): array
    {
        return ['nombre' => ['required', 'string', 'min:3', 'max:60']];
    }

    public function attributes(): array
    {
        return ['nombre' => 'nombre de la categoría'];
    }

    /** Compara sin mayúsculas ni tildes, y dice cuál es la que ya existe. */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                $existente = Categoria::where('clave', Categoria::clave((string) $this->input('nombre')))->value('nombre');

                if ($existente) {
                    $validator->errors()->add('nombre', "Ya existe la categoría «{$existente}».");
                }
            },
        ];
    }
}
