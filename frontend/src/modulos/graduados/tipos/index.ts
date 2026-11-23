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

/** Lo que publica el Directorio de Graduados (/alumni): sin carnet, correo ni teléfono. */
export type GraduadoPublico = Pick<
  Graduado,
  'id' | 'nombre_completo' | 'gestion_ingreso' | 'gestion_egreso' | 'modalidad' | 'titulo_tema'
>

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
