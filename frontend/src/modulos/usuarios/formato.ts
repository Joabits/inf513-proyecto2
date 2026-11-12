const FECHA_HORA = new Intl.DateTimeFormat('es-BO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export const formatoFechaHora = (iso: string) => FECHA_HORA.format(new Date(iso))

/** Iniciales para el distintivo de la cuenta: "Adriana Quiroga" -> "AQ". Ignora lo que no son palabras, como "(prueba)". */
export function iniciales(nombre: string) {
  const palabras = nombre.split(/\s+/).filter((palabra) => /^\p{L}/u.test(palabra))
  return palabras
    .slice(0, 2)
    .map((palabra) => palabra[0])
    .join('')
    .toUpperCase()
}

/** Para buscar sin importar mayúsculas ni tildes. */
export const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
