/** «Lic. Freddy Fuentes Soliz» → «FF»: se saltan los títulos, que terminan en punto. */
export const iniciales = (nombre: string) =>
  nombre
    .split(/\s+/)
    .filter((palabra) => palabra && !palabra.endsWith('.'))
    .slice(0, 2)
    .map((palabra) => palabra[0].toUpperCase())
    .join('')
