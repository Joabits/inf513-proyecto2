<?php

namespace App\Modulos\Inicio;

use Illuminate\Foundation\Http\FormRequest;

class ActualizarPortadaRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'distintivo' => ['nullable', 'string', 'max:80'],
            'titulo' => ['required', 'string', 'max:120'],
            'presentacion' => ['required', 'string', 'max:600'],
            'director_nombre' => ['required', 'string', 'max:120'],
            'director_cargo' => ['required', 'string', 'max:120'],
            'director_mensaje' => ['required', 'string', 'max:1200'],
        ];
    }

    public function attributes(): array
    {
        return [
            'distintivo' => 'distintivo',
            'presentacion' => 'texto de bienvenida',
            'director_nombre' => 'nombre del Director',
            'director_cargo' => 'cargo del Director',
            'director_mensaje' => 'mensaje del Director',
        ];
    }
}
