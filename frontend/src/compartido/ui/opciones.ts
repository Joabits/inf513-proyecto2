import type { OpcionSelector } from './Selector'

/** Opciones de un <Selector> a partir de un diccionario valor → nombre, como los de tipos y estados. */
export const opcionesDe = (nombres: Record<string, string>): OpcionSelector[] =>
  Object.entries(nombres).map(([valor, etiqueta]) => ({ valor, etiqueta }))
