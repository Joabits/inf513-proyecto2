<?php

namespace App\Modulos\Investigacion;

use App\Compartido\Busqueda\FuenteBusqueda;
use App\Compartido\Busqueda\Texto;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/** Proyectos publicados: el resultado abre la página de investigación filtrada por ese proyecto. */
class FuenteProyectos implements FuenteBusqueda
{
    public function tipo(): string
    {
        return 'proyecto';
    }

    public function etiqueta(): string
    {
        return 'Proyectos';
    }

    public function consulta(): Builder
    {
        return Proyecto::query()
            ->leftJoin('investigacion_lineas as linea', 'linea.id', '=', 'investigacion_proyectos.linea_id')
            ->where('investigacion_proyectos.publicado', true)
            ->select('investigacion_proyectos.*', 'linea.nombre as linea_nombre');
    }

    public function columnas(): array
    {
        return [
            'investigacion_proyectos.titulo',
            'investigacion_proyectos.resumen',
            'investigacion_proyectos.responsable',
            'investigacion_proyectos.integrantes',
            'linea.nombre',
        ];
    }

    public function orden(): array
    {
        return [['investigacion_proyectos.gestion', 'desc'], ['investigacion_proyectos.titulo', 'asc']];
    }

    public function resultado(Model $fila, array $terminos): array
    {
        return [
            'titulo' => $fila->titulo,
            'resumen' => Texto::fragmento($fila->resumen, $terminos),
            'meta' => Proyecto::TIPOS[$fila->tipo].' · Gestión '.$fila->gestion,
            'ruta' => '/investigacion?q='.rawurlencode($fila->titulo).'#proyectos',
            'externo' => false,
        ];
    }
}
