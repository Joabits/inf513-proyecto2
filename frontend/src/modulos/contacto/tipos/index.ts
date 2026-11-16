export interface MensajeContacto {
  id: number
  nombre: string
  correo: string
  telefono?: string | null
  asunto: string
  mensaje: string
  atendido: boolean
  respuesta: string | null
  creado_en: string
  created_at?: string
  updated_at?: string
}
