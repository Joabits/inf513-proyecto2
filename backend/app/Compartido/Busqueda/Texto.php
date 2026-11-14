<?php

namespace App\Compartido\Busqueda;

/**
 * Normalización para buscar sin distinguir mayúsculas ni tildes: «TITULACIÓN» encuentra «titulacion».
 * La ñ se conserva: «año» y «ano» son palabras distintas.
 *
 * Se hace igual en PHP (el término) y en SQL (las columnas), con REPLACE, que funciona
 * igual en PostgreSQL y en SQLite. Así se filtra en la base de datos sin cargar filas de más.
 */
class Texto
{
    /** Cada reemplazo es de un carácter a un carácter: el texto normalizado conserva las posiciones. */
    private const TILDES = [
        'á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u', 'ü' => 'u',
        'Á' => 'a', 'É' => 'e', 'Í' => 'i', 'Ó' => 'o', 'Ú' => 'u', 'Ü' => 'u',
        // LOWER de SQLite solo convierte letras ASCII
        'Ñ' => 'ñ',
    ];

    public const MAXIMO_TERMINOS = 5;

    public static function normalizar(string $texto): string
    {
        return mb_strtolower(strtr(preg_replace('/\s+/u', ' ', trim($texto)), self::TILDES));
    }

    /** «  Reglamento   de TITULACIÓN » → ['reglamento', 'de', 'titulacion']. Las letras sueltas se descartan. */
    public static function terminos(string $consulta): array
    {
        $palabras = array_filter(explode(' ', self::normalizar($consulta)), fn ($p) => mb_strlen($p) >= 2);

        return array_slice(array_values(array_unique($palabras)), 0, self::MAXIMO_TERMINOS);
    }

    /** La misma normalización, como expresión SQL sobre una columna. */
    public static function sql(string $columna): string
    {
        $expresion = "COALESCE({$columna}, '')";
        foreach (self::TILDES as $de => $a) {
            $expresion = "REPLACE({$expresion}, '{$de}', '{$a}')";
        }

        return "LOWER({$expresion})";
    }

    /**
     * Carácter de escape para LIKE. No se usa la barra invertida porque PDO la toma como escape
     * de comillas dentro de '\'' y deja de reconocer el parámetro que sigue.
     */
    public const ESCAPE = '!';

    /** Condición LIKE lista para una columna: usar con el valor de patron(). */
    public static function like(string $columna): string
    {
        return self::sql($columna)." LIKE ? ESCAPE '".self::ESCAPE."'";
    }

    /** Para LIKE: «100%» busca el texto «100%», no «100 seguido de cualquier cosa». */
    public static function patron(string $termino): string
    {
        $e = self::ESCAPE;

        return '%'.strtr($termino, [$e => $e.$e, '%' => $e.'%', '_' => $e.'_']).'%';
    }

    /** Un trozo del texto alrededor de la primera coincidencia, para mostrar en el resultado. */
    public static function fragmento(?string $texto, array $terminos, int $largo = 180): ?string
    {
        if ($texto === null || trim($texto) === '') {
            return null;
        }

        $texto = preg_replace('/\s+/u', ' ', trim($texto));
        if (mb_strlen($texto) <= $largo) {
            return $texto;
        }

        $normalizado = mb_strtolower(strtr($texto, self::TILDES));
        $posiciones = array_filter(array_map(fn ($t) => mb_strpos($normalizado, $t), $terminos), fn ($p) => $p !== false);
        $inicio = $posiciones ? max(0, min($posiciones) - intdiv($largo, 3)) : 0;
        $trozo = mb_substr($texto, $inicio, $largo);
        $cortaFinal = $inicio + $largo < mb_strlen($texto);

        // Sin palabras partidas: se descarta el pedazo de palabra de cada extremo
        if ($inicio > 0 && ($espacio = mb_strpos($trozo, ' ')) !== false) {
            $trozo = mb_substr($trozo, $espacio + 1);
        }
        if ($cortaFinal && ($espacio = mb_strrpos($trozo, ' ')) !== false) {
            $trozo = mb_substr($trozo, 0, $espacio);
        }

        return ($inicio > 0 ? '…' : '').rtrim(trim($trozo), ',;:').($cortaFinal ? '…' : '');
    }

    /** ¿El texto contiene todos los términos? */
    public static function contiene(?string $texto, array $terminos): bool
    {
        $normalizado = self::normalizar((string) $texto);

        return collect($terminos)->every(fn ($t) => str_contains($normalizado, $t));
    }
}
