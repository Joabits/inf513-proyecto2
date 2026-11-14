<?php

namespace App\Compartido\Busqueda;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * Una entidad que se puede encontrar desde el buscador del portal (CU-07).
 *
 * Cada módulo declara las suyas en app/Modulos/<Modulo>/busqueda.php, que devuelve
 * la lista de clases. La búsqueda las descubre sola, igual que las rutas: agregar una
 * fuente no obliga a tocar ningún archivo compartido.
 *
 * Solo se busca lo que el visitante ya puede ver: consulta() debe filtrar lo oculto,
 * y columnas() debe listar únicamente campos públicos (nunca correos, teléfonos ni datos personales).
 */
interface FuenteBusqueda
{
    /** Clave del tipo de resultado, en singular: 'documento', 'materia'... */
    public function tipo(): string;

    /** Nombre del grupo que ve el visitante: 'Documentos', 'Materias'... */
    public function etiqueta(): string;

    /** Consulta de lo publicado, sin ordenar y sin filtrar por términos. */
    public function consulta(): Builder;

    /** @return string[] Columnas donde buscar. La primera es el título: sus coincidencias van primero. */
    public function columnas(): array;

    /** @return array<int, array{0: string, 1: string}> Orden de los resultados con igual relevancia: [[columna, 'asc'|'desc'], ...] */
    public function orden(): array;

    /**
     * @param  string[]  $terminos  Términos ya normalizados (sin tildes y en minúsculas)
     * @return array{titulo: string, resumen: ?string, meta: ?string, ruta: string, externo: bool}
     */
    public function resultado(Model $fila, array $terminos): array;
}
