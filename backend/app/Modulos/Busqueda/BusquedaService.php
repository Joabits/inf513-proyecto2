<?php

namespace App\Modulos\Busqueda;

use App\Compartido\Busqueda\FuenteBusqueda;
use App\Compartido\Busqueda\Texto;
use Illuminate\Database\Eloquent\Builder;

class BusquedaService
{
    /** Resultados por grupo en la vista «Todos» y al elegir un solo tipo */
    public const POR_GRUPO = 5;

    public const POR_TIPO = 30;

    /** @var FuenteBusqueda[]|null */
    private ?array $fuentes = null;

    /** @return FuenteBusqueda[] Las fuentes que declara cada módulo en su busqueda.php */
    public function fuentes(): array
    {
        return $this->fuentes ??= collect(glob(app_path('Modulos/*/busqueda.php')))
            ->flatMap(fn (string $archivo) => require $archivo)
            ->map(fn (string $clase) => app($clase))
            ->values()
            ->all();
    }

    public function tipos(): array
    {
        return array_map(fn (FuenteBusqueda $fuente) => $fuente->tipo(), $this->fuentes());
    }

    /**
     * Busca en cada fuente con su propia consulta: se filtra y se cuenta en la base de datos,
     * y solo se traen las filas que se van a mostrar.
     */
    public function buscar(string $consulta, ?string $tipo = null): array
    {
        $terminos = Texto::terminos($consulta);
        $grupos = [];

        foreach ($terminos ? $this->fuentes() : [] as $fuente) {
            $filtrada = $this->filtrar($fuente, $terminos);
            $total = (clone $filtrada)->count();
            if ($total === 0) {
                continue;
            }

            $limite = $tipo === null ? self::POR_GRUPO : ($tipo === $fuente->tipo() ? self::POR_TIPO : 0);
            $filas = $limite > 0 ? $this->ordenar($filtrada, $fuente, $terminos)->limit($limite)->get() : collect();

            $grupos[] = [
                'tipo' => $fuente->tipo(),
                'etiqueta' => $fuente->etiqueta(),
                'total' => $total,
                'resultados' => $filas->map(fn ($fila) => $fuente->resultado($fila, $terminos))->values()->all(),
            ];
        }

        return [
            'consulta' => $consulta,
            'total' => array_sum(array_column($grupos, 'total')),
            'grupos' => $grupos,
        ];
    }

    /** Cada término debe aparecer en alguna de las columnas: «reglamento titulación» exige las dos palabras. */
    private function filtrar(FuenteBusqueda $fuente, array $terminos): Builder
    {
        $consulta = $fuente->consulta();

        foreach ($terminos as $termino) {
            $consulta->where(function (Builder $alguna) use ($fuente, $termino) {
                foreach ($fuente->columnas() as $columna) {
                    $alguna->orWhereRaw(Texto::like($columna), [Texto::patron($termino)]);
                }
            });
        }

        return $consulta;
    }

    /** Primero lo que tiene todos los términos en el título; después, el orden propio de la fuente. */
    private function ordenar(Builder $consulta, FuenteBusqueda $fuente, array $terminos): Builder
    {
        $condicion = implode(' AND ', array_fill(0, count($terminos), Texto::like($fuente->columnas()[0])));
        $consulta->orderByRaw("CASE WHEN {$condicion} THEN 0 ELSE 1 END", array_map([Texto::class, 'patron'], $terminos));

        foreach ($fuente->orden() as [$columna, $direccion]) {
            $consulta->orderBy($columna, $direccion);
        }

        return $consulta;
    }
}
