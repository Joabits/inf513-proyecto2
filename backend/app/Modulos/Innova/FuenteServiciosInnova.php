<?php

namespace App\Modulos\Innova;

use App\Compartido\Busqueda\FuenteBusqueda;
use App\Compartido\Busqueda\Texto;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model as Fila;

/** Servicios de INNOVA (plan de negocios, estudio de mercado...): el resultado abre la página donde se solicitan. */
class FuenteServiciosInnova implements FuenteBusqueda
{
    public function tipo(): string
    {
        return 'servicio_innova';
    }

    public function etiqueta(): string
    {
        return 'Servicios de INNOVA';
    }

    public function consulta(): Builder
    {
        return ServicioInnova::query();
    }

    public function columnas(): array
    {
        return ['nombre', 'descripcion'];
    }

    public function orden(): array
    {
        return [['orden', 'asc'], ['id', 'asc']];
    }

    public function resultado(Fila $fila, array $terminos): array
    {
        /** @var ServicioInnova $fila */
        return [
            'titulo' => $fila->nombre,
            'resumen' => Texto::fragmento($fila->descripcion, $terminos) ?? $fila->descripcion,
            'meta' => 'Servicio de la Empresa Junior INNOVA',
            'ruta' => '/empresa-junior',
            'externo' => false,
        ];
    }
}
