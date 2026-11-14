<?php

namespace App\Modulos\Institucional;

use App\Compartido\Busqueda\FuenteBusqueda;
use App\Compartido\Busqueda\Texto;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * Textos de la página «La Carrera». Es una sola fila: el resultado nombra la sección donde
 * aparecen los términos (misión, perfil profesional...) y muestra ese trozo.
 * También se encuentra por el nombre de la sección: «misión» lleva a la misión aunque
 * su texto no diga esa palabra.
 */
class FuenteInstitucional implements FuenteBusqueda
{
    /** Columna => nombre de la sección en la página */
    private const SECCIONES = [
        'presentacion' => 'Presentación',
        'mision' => 'Misión',
        'vision' => 'Visión',
        'perfil_profesional' => 'Perfil profesional',
        'campo_ocupacional' => 'Campo ocupacional',
        'resena_historica' => 'Reseña histórica',
    ];

    public function tipo(): string
    {
        return 'carrera';
    }

    public function etiqueta(): string
    {
        return 'La Carrera';
    }

    public function consulta(): Builder
    {
        return Institucional::query();
    }

    /** Los textos y, como valores fijos, los nombres de las secciones. */
    public function columnas(): array
    {
        $nombres = array_map(fn ($nombre) => DB::getPdo()->quote($nombre), array_values(self::SECCIONES));

        return [...array_keys(self::SECCIONES), ...$nombres];
    }

    public function orden(): array
    {
        return [];
    }

    public function resultado(Model $fila, array $terminos): array
    {
        $columnas = array_keys(self::SECCIONES);

        // 1) La sección cuyo nombre se buscó; 2) la que tiene todos los términos; 3) la primera con alguno
        $columna = collect($columnas)->first(fn ($c) => collect($terminos)->contains(fn ($t) => Texto::contiene(self::SECCIONES[$c], [$t])))
            ?? collect($columnas)->first(fn ($c) => Texto::contiene($fila->{$c}, $terminos))
            ?? collect($columnas)->first(fn ($c) => collect($terminos)->contains(fn ($t) => Texto::contiene($fila->{$c}, [$t])))
            ?? 'presentacion';

        return [
            'titulo' => self::SECCIONES[$columna],
            'resumen' => Texto::fragmento($fila->{$columna}, $terminos),
            'meta' => 'La Carrera',
            'ruta' => '/carrera',
            'externo' => false,
        ];
    }
}
