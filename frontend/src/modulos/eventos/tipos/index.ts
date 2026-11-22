export interface Evento {
  id: number
  titulo: string
  descripcion: string
  fecha_inicio: string
  fecha_fin: string
  fecha_inicio_iso?: string
  fecha_fin_iso?: string
  lugar: string
  enlace: string | null
  /** Solo en el panel */
  publicado?: boolean
  /** Solo en el panel: es la cuenta que lo cargó, no quien lo organiza */
  autor?: string
}

export type EventoEntrada = {
  titulo: string
  descripcion: string
  fecha_inicio: string
  fecha_fin: string
  lugar: string
  enlace?: string | null
  publicado: boolean
}
