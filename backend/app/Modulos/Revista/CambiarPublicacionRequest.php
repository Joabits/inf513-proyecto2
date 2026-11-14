<?php

namespace App\Modulos\Revista;

use Illuminate\Foundation\Http\FormRequest;

class CambiarPublicacionRequest extends FormRequest
{
    public function rules(): array
    {
        return ['publicada' => ['required', 'boolean']];
    }
}
