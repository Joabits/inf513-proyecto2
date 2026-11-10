<?php

namespace App\Modulos\Inicio;

use Illuminate\Foundation\Http\FormRequest;

class OrdenarBannersRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'distinct', 'exists:inicio_banners,id'],
        ];
    }
}
