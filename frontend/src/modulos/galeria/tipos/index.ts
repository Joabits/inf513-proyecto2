export interface Galeria {
  id: number
  titulo: string | null
  descripcion: string | null
  imagen: string
  /** Solo en el panel */
  publicado?: boolean
  /** Solo en el panel */
  autor?: string | null
  creado_en: string
}
