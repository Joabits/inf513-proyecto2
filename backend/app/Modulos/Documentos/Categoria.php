<?php

namespace App\Modulos\Documentos;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Categoria extends Model
{
    protected $table = 'documento_categorias';

    protected $fillable = ['nombre'];

    /** «Reglamentos», «reglamentos» y «REGLAMENTOS» tienen la misma clave. */
    public static function clave(string $nombre): string
    {
        return Str::lower(Str::ascii(Str::squish($nombre)));
    }

    protected static function booted(): void
    {
        static::saving(function (Categoria $categoria) {
            $categoria->nombre = Str::squish($categoria->nombre);
            $categoria->clave = self::clave($categoria->nombre);
        });
    }
}
