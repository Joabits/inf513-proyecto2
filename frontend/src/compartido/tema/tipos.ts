export type Tema = 'ninos' | 'jovenes' | 'adultos'
export type PreferenciaModo = 'auto' | 'claro' | 'oscuro'
export type Modo = 'claro' | 'oscuro'
export type Contraste = 'normal' | 'alto'

export interface PreferenciasTema {
  tema: Tema
  modo: PreferenciaModo
  tamano: number // factor del tamaño de letra: 0.875 | 1 | 1.125 | 1.25
  contraste: Contraste
}

export const TAMANOS = [0.875, 1, 1.125, 1.25] as const

/** Horario en que el modo automático pasa a noche (hora local del visitante). */
export const HORA_INICIO_NOCHE = 19
export const HORA_FIN_NOCHE = 7

/** Día o noche según la hora del cliente (requisito 5). */
export function modoSegunHora(fecha = new Date()): Modo {
  const hora = fecha.getHours()
  return hora >= HORA_INICIO_NOCHE || hora < HORA_FIN_NOCHE ? 'oscuro' : 'claro'
}
