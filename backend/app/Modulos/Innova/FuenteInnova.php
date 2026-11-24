<?php

namespace App\Modulos\Innova;

use App\Compartido\Busqueda\FuenteBusqueda;
use App\Compartido\Busqueda\Texto;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model as Fila;

/** Empresa Junior INNOVA (CU-22): su presentación, misión y visión. El correo es un dato de contacto, no se busca. */
class FuenteInnova implements FuenteBusqueda
{
    private const COLUMNAS = ['presentacion', 'mision', 'vision'];

    public function tipo(): string
    {
        return 'innova';
    }

    public function etiqueta(): string
    {
        return 'Empresa Junior INNOVA';
    }

    public function consulta(): Builder
    {
        return Innova::query();
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
        /** @var Innova $fila */
        $texto = collect(self::COLUMNAS)->map(fn ($c) => $fila->{$c})->first(fn ($t) => Texto::contiene($t, $terminos)) ?? $fila->presentacion;

        return [
            'titulo' => 'Empresa Junior INNOVA',
            'resumen' => Texto::fragmento($texto, $terminos) ?? $texto,
            'meta' => 'Vinculación',
            'ruta' => '/empresa-junior',
            'externo' => false,
        ];
    }
}
