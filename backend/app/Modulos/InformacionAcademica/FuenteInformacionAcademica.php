<?php

namespace App\Modulos\InformacionAcademica;

use App\Compartido\Busqueda\FuenteBusqueda;
use App\Compartido\Busqueda\Texto;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model as Fila;

/** Información académica (CU-16): misión, visión, perfil profesional y campo ocupacional. */
class FuenteInformacionAcademica implements FuenteBusqueda
{
    private const COLUMNAS = ['mision', 'vision', 'perfil_profesional', 'objetivos'];

    public function tipo(): string
    {
        return 'informacion_academica';
    }

    public function etiqueta(): string
    {
        return 'Información académica';
    }

    public function consulta(): Builder
    {
        return Model::query();
    }

    public function columnas(): array
    {
        return self::COLUMNAS;
    }

    public function orden(): array
    {
        return [['id', 'asc']];
    }

    public function resultado(Fila $fila, array $terminos): array
    {
        /** @var Model $fila */
        // El fragmento sale del primer apartado que contiene lo buscado
        $texto = collect(self::COLUMNAS)->map(fn ($c) => $fila->{$c})->first(fn ($t) => Texto::contiene($t, $terminos)) ?? $fila->mision;

        return [
            'titulo' => 'Información académica de la Carrera',
            'resumen' => Texto::fragmento($texto, $terminos) ?? $texto,
            'meta' => 'Oferta académica',
            'ruta' => '/informacion-academica',
            'externo' => false,
        ];
    }
}
