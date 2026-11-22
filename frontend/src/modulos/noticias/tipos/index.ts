export interface Noticia {
  id: number
  titulo: string
  resumen: string
  /** Solo en el detalle y en el panel */
  contenido?: string
  imagen: string | null
  /** Solo en el panel */
  publicada?: boolean
  publicada_en: string | null
  /** Solo en el panel: es la cuenta que la cargó, no se muestra al público */
  autor?: string
  creada_en: string
}
