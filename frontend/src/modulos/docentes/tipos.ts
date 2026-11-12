/** Igual que Persona::GRUPOS, en el orden en que se muestran */
export const GRUPOS = {
  autoridad: 'Autoridades',
  administrativo: 'Personal administrativo',
  docente: 'Personal docente',
} as const

export type Grupo = keyof typeof GRUPOS

/** Igual que PersonaResource.php */
export interface Persona {
  id: number
  nombre: string
  cargo: string
  grupo: Grupo
  foto: string | null
  visible: boolean
  /** Se muestra grande al inicio de la página pública */
  destacado: boolean
}
