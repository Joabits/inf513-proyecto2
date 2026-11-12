<?php

namespace App\Modulos\Configuracion;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class GuardarRedesRequest extends FormRequest
{
    public const NOMBRES = [
        'facebook' => 'Facebook',
        'instagram' => 'Instagram',
        'tiktok' => 'TikTok',
        'youtube' => 'YouTube',
        'linkedin' => 'LinkedIn',
        'x' => 'X (Twitter)',
    ];

    public function rules(): array
    {
        return [
            'redes' => ['present', 'array', 'max:'.count(RedSocial::DOMINIOS)],
            'redes.*.red' => ['required', 'string', Rule::in(array_keys(RedSocial::DOMINIOS)), 'distinct'],
            'redes.*.url' => ['required', 'string', 'max:300', 'url:https'],
        ];
    }

    public function attributes(): array
    {
        return ['redes.*.red' => 'red social', 'redes.*.url' => 'enlace'];
    }

    public function messages(): array
    {
        return [
            'redes.*.red.in' => 'Elija una red de la lista.',
            'redes.*.red.distinct' => 'Esa red ya está en la lista.',
            'redes.*.url.url' => 'El enlace debe ser una dirección web que empiece con https://.',
        ];
    }

    /** Evita pegar el enlace de una red en otra (por ejemplo, un enlace de Instagram como Facebook). */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                foreach ((array) $this->input('redes') as $i => $fila) {
                    $red = $fila['red'] ?? null;
                    $url = $fila['url'] ?? null;

                    if (! isset(RedSocial::DOMINIOS[$red]) || ! is_string($url) || $validator->errors()->has("redes.$i.url")) {
                        continue;
                    }

                    if (! RedSocial::urlEsDeLaRed($red, $url)) {
                        $validator->errors()->add("redes.$i.url", 'El enlace no es de '.self::NOMBRES[$red].'.');
                    }
                }
            },
        ];
    }
}
