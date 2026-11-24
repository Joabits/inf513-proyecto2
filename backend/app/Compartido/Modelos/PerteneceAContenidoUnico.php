<?php

namespace App\Compartido\Modelos;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Validation\ValidationException;

/**
 * Para las listas que cuelgan del contenido de una sección (hitos, cifras, servicios, semilleros, materias...).
 * Cada sección tiene una sola fila de contenido; al crear un elemento de la lista se enlaza solo a esa fila,
 * así los servicios y seeders no tienen que pasar la clave.
 *
 * El modelo que lo usa define la constante CONTENIDO = [columna de la clave, clase del contenido].
 */
trait PerteneceAContenidoUnico
{
    protected static function bootPerteneceAContenidoUnico(): void
    {
        static::creating(function (Model $fila) {
            [$columna, $contenido] = static::CONTENIDO;

            $fila->{$columna} ??= $contenido::query()->orderBy('id')->value('id')
                ?? throw ValidationException::withMessages([
                    'contenido' => 'Primero guarde la presentación de esta sección y después sus elementos.',
                ]);
        });
    }

    public function contenido(): BelongsTo
    {
        [$columna, $contenido] = static::CONTENIDO;

        return $this->belongsTo($contenido, $columna);
    }
}
