const FECHA = new Intl.DateTimeFormat('es-BO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export const formatoFecha = (iso: string) => FECHA.format(new Date(iso))

/** Para buscar sin importar mayúsculas ni tildes. */
export const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

/** Los textos se guardan sin HTML: cada línea en blanco separa un párrafo. */
export const parrafos = (texto: string) =>
  texto
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
