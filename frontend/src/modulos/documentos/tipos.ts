export type TipoDocumento = 'pdf' | 'xlsx'

export interface Documento {
  id: number
  titulo: string
  descripcion: string | null
  categoria: string
  tipo: TipoDocumento
  tamano: number
  nombre_original: string
  publicado: boolean
  versiones: number
  actualizado: string
}

export interface VersionDocumento {
  id: number
  tipo: TipoDocumento
  tamano: number
  nombre_original: string
  reemplazado: string
}
