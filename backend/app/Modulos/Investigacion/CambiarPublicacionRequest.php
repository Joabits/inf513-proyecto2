<?php

namespace App\Modulos\Investigacion;

use Illuminate\Foundation\Http\FormRequest;

class CambiarPublicacionRequest extends FormRequest
{
    public function rules(): array
    {
        return ['publicado' => ['required', 'boolean']];
    }
}
