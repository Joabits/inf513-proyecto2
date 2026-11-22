export interface CategoriaObj {
  id: number
  nombre: string
}

export interface Documento {
  id: number
  titulo: string
  descripcion: string | null
  categoria: string | CategoriaObj
  archivo_url?: string
  tamaño?: string
  tamano?: string | number
  creado_en?: string
  creado?: string
  tipo?: string
}
