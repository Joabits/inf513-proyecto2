/**
 * Igual que Texto::normalizar() del backend, carácter por carácter: sin tildes y en minúsculas,
 * conservando la ñ. Cada carácter da uno solo, así las posiciones coinciden con el texto original.
 */
function normalizarCaracter(c: string) {
  const minuscula = c.toLowerCase()
  if (minuscula === 'ñ') return 'ñ'
  return minuscula.normalize('NFD').replace(/\p{Diacritic}/gu, '').charAt(0) || minuscula
}

const normalizar = (texto: string) => Array.from(texto, normalizarCaracter).join('')

export const terminosDe = (consulta: string) =>
  [...new Set(normalizar(consulta.trim()).split(/\s+/).filter((t) => t.length >= 2))]

/** Divide el texto en trozos, marcando los que coinciden con algún término. */
export function trozos(texto: string, terminos: string[]): { texto: string; marcado: boolean }[] {
  const caracteres = Array.from(texto)
  const normalizado = caracteres.map(normalizarCaracter).join('')
  const marcas = new Array<boolean>(caracteres.length).fill(false)

  for (const termino of terminos) {
    let desde = normalizado.indexOf(termino)
    while (desde !== -1) {
      for (let i = desde; i < desde + termino.length; i++) marcas[i] = true
      desde = normalizado.indexOf(termino, desde + termino.length)
    }
  }

  const resultado: { texto: string; marcado: boolean }[] = []
  caracteres.forEach((c, i) => {
    const ultimo = resultado.at(-1)
    if (ultimo && ultimo.marcado === marcas[i]) ultimo.texto += c
    else resultado.push({ texto: c, marcado: marcas[i] })
  })
  return resultado
}
