/** «Director de Carrera (prueba)» → «DC». Se usa en el círculo del menú de perfil. */
export const iniciales = (nombre: string) =>
  nombre
    .replace(/\(.*?\)/g, '')
    .split(/\s+/)
    .filter((palabra) => palabra.length > 2)
    .slice(0, 2)
    .map((palabra) => palabra[0].toUpperCase())
    .join('')
