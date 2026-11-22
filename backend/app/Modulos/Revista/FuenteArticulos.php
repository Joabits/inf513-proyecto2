<?php

namespace App\Modulos\Revista;

use App\Compartido\Busqueda\FuenteBusqueda;
use App\Compartido\Busqueda\Texto;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * Artículos de las ediciones publicadas: se encuentran por título, autores o resumen. Si el artículo tiene PDF,
 * el resultado lo abre (como un documento); si no, lleva a su edición en la página pública.
 */
class FuenteArticulos implements FuenteBusqueda
{
    public function tipo(): string
    {
        return 'articulo';
    }

    public function etiqueta(): string
    {
        return 'Artículos de INNOVAR';
    }

    public function consulta(): Builder
    {
        return Articulo::query()
            ->join('revista_ediciones as edicion', 'edicion.id', '=', 'revista_articulos.edicion_id')
            ->where('edicion.publicada', true)
            ->select('revista_articulos.*', 'edicion.volumen', 'edicion.numero', 'edicion.anio');
    }

    public function columnas(): array
    {
        return ['revista_articulos.titulo', 'revista_articulos.autores', 'revista_articulos.resumen'];
    }

    public function orden(): array
    {
        return [['edicion.anio', 'desc'], ['edicion.numero', 'desc'], ['revista_articulos.orden', 'asc']];
    }

    public function resultado(Model $fila, array $terminos): array
    {
        $edicion = collect([$fila->volumen ? "Volumen {$fila->volumen}" : null, "Número {$fila->numero}", $fila->anio])->filter()->implode(' · ');

        return [
            'titulo' => $fila->titulo,
            'resumen' => Texto::fragmento($fila->resumen, $terminos) ?? $fila->autores,
            'meta' => implode(' · ', array_filter([$fila->autores, "INNOVAR {$edicion}"])),
            'ruta' => $fila->archivo ? "/api/revista/articulos/{$fila->id}/archivo" : "/revista-innovar#edicion-{$fila->edicion_id}",
            'externo' => (bool) $fila->archivo,
        ];
    }
}
