const FECHA_LARGA = new Intl.DateTimeFormat('es-BO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

/** '1970-05-15' -> '15 de mayo de 1970' (sin que la zona horaria la mueva un día). */
export const fechaLarga = (fecha: string) => FECHA_LARGA.format(new Date(`${fecha}T00:00:00Z`))

/** Los textos se guardan sin HTML: cada línea en blanco separa un párrafo. */
export const parrafos = (texto: string) =>
  texto
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
