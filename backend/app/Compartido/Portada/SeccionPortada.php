<?php

namespace App\Compartido\Portada;

/**
 * Contenido de un módulo que se muestra en la página de inicio (CU-01: noticias y eventos en la portada).
 *
 * Cada módulo declara las suyas en app/Modulos/<Modulo>/en_portada.php, que devuelve la lista de clases.
 * La portada las descubre sola, igual que el buscador: el módulo Inicio no conoce las tablas de los demás
 * y agregar una sección no obliga a tocar ningún archivo compartido.
 *
 * Solo se devuelve lo que el visitante ya puede ver y únicamente los campos que la portada muestra.
 */
interface SeccionPortada
{
    /** Clave de la sección en la respuesta de /api/inicio: 'noticias', 'eventos'... */
    public function clave(): string;

    /** @return list<array<string, mixed>> Elementos listos para mostrar, ya ordenados y limitados */
    public function elementos(): array;
}
