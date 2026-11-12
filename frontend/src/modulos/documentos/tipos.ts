export type TipoDocumento = 'pdf' | 'docx' | 'xlsx'

export interface Categoria {
  id: number
  nombre: string
}

export interface Documento {
  id: number
  titulo: string
  descripcion: string | null
  categoria: Categoria
  tipo: TipoDocumento
  mime: string
  tamano: number
  nombre_original: string
  publicado: boolean
  subido_por: string | null
  versiones: number
  creado: string
  actualizado: string
}

export interface VersionDocumento {
  id: number
  tipo: TipoDocumento
  tamano: number
  nombre_original: string
  subido_por: string | null
  reemplazado: string
}
