<?php

namespace App\Modulos\Documentos;

use App\Compartido\Busqueda\FuenteBusqueda;
use App\Compartido\Busqueda\Texto;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/** Documentos publicados: el resultado abre el archivo. */
class FuenteDocumentos implements FuenteBusqueda
{
    public function tipo(): string
    {
        return 'documento';
    }

    public function etiqueta(): string
    {
        return 'Documentos';
    }

    public function consulta(): Builder
    {
        return Documento::query()
            ->join('documento_categorias as categoria', 'categoria.id', '=', 'documentos.categoria_id')
            ->where('documentos.publicado', true)
            ->select('documentos.*', 'categoria.nombre as categoria_nombre');
    }

    public function columnas(): array
    {
        return ['documentos.titulo', 'documentos.descripcion', 'categoria.nombre'];
    }

    public function orden(): array
    {
        return [['documentos.updated_at', 'desc']];
    }

    public function resultado(Model $fila, array $terminos): array
    {
        return [
            'titulo' => $fila->titulo,
            'resumen' => Texto::fragmento($fila->descripcion, $terminos),
            'meta' => $fila->categoria_nombre.' · '.strtoupper($fila->tipo),
            'ruta' => "/api/documentos/{$fila->id}/descargar",
            'externo' => true,
        ];
    }
}
