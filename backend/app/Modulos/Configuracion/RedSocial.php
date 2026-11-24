<?php

namespace App\Modulos\Configuracion;

use App\Compartido\Modelos\PerteneceAContenidoUnico;
use Illuminate\Database\Eloquent\Model;

class RedSocial extends Model
{
    use PerteneceAContenidoUnico;

    public const CONTENIDO = ['configuracion_id', DatosContacto::class];

    /** Redes admitidas y los dominios válidos de cada una (así no se pega un enlace de otra red por error). */
    public const DOMINIOS = [
        'facebook' => ['facebook.com', 'fb.com'],
        'instagram' => ['instagram.com'],
        'tiktok' => ['tiktok.com'],
        'youtube' => ['youtube.com', 'youtu.be'],
        'linkedin' => ['linkedin.com'],
        'x' => ['x.com', 'twitter.com'],
    ];

    protected $table = 'configuracion_redes';

    protected $fillable = ['red', 'url', 'orden'];

    /** ¿La dirección pertenece a esa red? Acepta subdominios como www. o m. */
    public static function urlEsDeLaRed(string $red, string $url): bool
    {
        $host = strtolower((string) parse_url($url, PHP_URL_HOST));

        foreach (self::DOMINIOS[$red] ?? [] as $dominio) {
            if ($host === $dominio || str_ends_with($host, '.'.$dominio)) {
                return true;
            }
        }

        return false;
    }
}
