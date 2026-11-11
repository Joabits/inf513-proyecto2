<?php

namespace App\Modulos\Configuracion;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class GuardarEnlacesRequest extends FormRequest
{
    /** Página del portal (/documentos) o sitio externo seguro (https://...). */
    public const ENLACE = '/^(\/(?!\/)|https:\/\/)/';

    public const MAXIMO = 8;

    public function rules(): array
    {
        return [
            'enlaces' => ['present', 'array', 'max:'.self::MAXIMO],
            'enlaces.*.titulo' => ['required', 'string', 'max:60'],
            'enlaces.*.url' => ['required', 'string', 'max:300', 'regex:'.self::ENLACE],
        ];
    }

    public function attributes(): array
    {
        return ['enlaces.*.titulo' => 'título', 'enlaces.*.url' => 'enlace'];
    }

    public function messages(): array
    {
        return ['enlaces.*.url.regex' => 'El enlace debe empezar con / o con https://.'];
    }

    /** Un enlace externo, además de empezar con https://, debe ser una dirección web válida. */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                foreach ((array) $this->input('enlaces') as $i => $fila) {
                    $url = $fila['url'] ?? null;

                    if (is_string($url) && str_starts_with($url, 'https://') && ! filter_var($url, FILTER_VALIDATE_URL)
                        && ! $validator->errors()->has("enlaces.$i.url")) {
                        $validator->errors()->add("enlaces.$i.url", 'El enlace no es una dirección web válida.');
                    }
                }
            },
        ];
    }
}
