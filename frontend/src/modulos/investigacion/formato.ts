/** Los textos se guardan sin HTML: cada línea en blanco separa un párrafo. */
export const parrafos = (texto: string) =>
  texto
    .split(/\n\s*\n/)
    .map((parrafo) => parrafo.trim())
    .filter(Boolean)

/** Una línea por elemento, como los objetivos de los semilleros. */
export const renglones = (texto: string) =>
  texto
    .split('\n')
    .map((renglon) => renglon.trim())
    .filter(Boolean)

/** 3 -> «03»: numera las líneas de investigación. */
export const numero = (n: number) => String(n).padStart(2, '0')
