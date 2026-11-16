export interface Noticia {
  id: number
  titulo: string
  resumen: string
  contenido: string
  imagen: string | null
  publicada: boolean
  publicada_en: string | null
  autor: string
  creada_en: string
}
