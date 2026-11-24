export interface Vinculacion {
  id: number
  titulo: string
  descripcion: string
  enlace: string | null
  imagen: string | null
  /** Solo en el panel: la API pública no lo envía */
  publicado?: boolean
  /** Solo en el panel: es la cuenta que la cargó, no se muestra al público */
  autor?: string | null
  creado_en: string | null
}
