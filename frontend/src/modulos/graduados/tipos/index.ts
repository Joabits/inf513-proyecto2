export interface Graduado {
  id: number
  nombre_completo: string
  ci: string
  correo: string | null
  telefono: string | null
  gestion_ingreso: string
  gestion_egreso: string
  modalidad: string
  titulo_tema: string | null
  user_id: number
  autor?: {
    id: number
    name: string
    email: string
  } | null
  creado?: string
  actualizado?: string
  created_at?: string
  updated_at?: string
}

export type GraduadoFormEntrada = {
  nombre_completo: string
  ci: string
  correo?: string | null
  telefono?: string | null
  gestion_ingreso: string
  gestion_egreso: string
  modalidad: string
  titulo_tema?: string | null
}
