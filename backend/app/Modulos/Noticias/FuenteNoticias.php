<?php

namespace App\Modulos\Noticias;

use App\Compartido\Busqueda\FuenteBusqueda;
use App\Compartido\Busqueda\Texto;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model as Fila;

/** Noticias publicadas: el resultado abre la noticia. No se busca el autor (es un dato interno). */
class FuenteNoticias implements FuenteBusqueda
{
    public function tipo(): string
    {
        return 'noticia';
    }

    public function etiqueta(): string
    {
        return 'Noticias';
    }

    public function consulta(): Builder
    {
        return Model::query()->where('publicada', true);
    }

    public function columnas(): array
    {
        return ['titulo', 'resumen', 'contenido'];
    }

    public function orden(): array
    {
        return [['publicada_en', 'desc'], ['id', 'desc']];
    }

    public function resultado(Fila $fila, array $terminos): array
    {
        /** @var Model $fila */
        $fecha = $fila->publicada_en ?? $fila->created_at;

        return [
            'titulo' => $fila->titulo,
            // El resumen es lo que escribió el editor para presentar la noticia; si la coincidencia está en el texto, se muestra ese fragmento
            'resumen' => Texto::contiene($fila->resumen, $terminos) ? Texto::fragmento($fila->resumen, $terminos) : (Texto::fragmento($fila->contenido, $terminos) ?? $fila->resumen),
            'meta' => 'Noticia'.($fecha ? ' · '.$fecha->locale('es')->isoFormat('D MMM YYYY') : ''),
            'ruta' => "/noticias/{$fila->id}",
            'externo' => false,
        ];
    }
}
