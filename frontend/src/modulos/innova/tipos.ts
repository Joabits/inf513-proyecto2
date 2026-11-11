/** Igual que InnovaController::mostrar() */
export interface ContenidoInnova {
  presentacion: string
  mision: string | null
  vision: string | null
  correo: string | null
  recibe_solicitudes: boolean
}

export interface ServicioInnova {
  id: number
  nombre: string
  descripcion: string
}

export interface InformacionInnova {
  contenido: ContenidoInnova | null
  servicios: ServicioInnova[]
}

/** Igual que SolicitudInnova::ESTADOS */
export const ESTADOS = {
  pendiente: 'Pendiente',
  en_revision: 'En revisión',
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
  finalizada: 'Finalizada',
} as const

export type EstadoSolicitud = keyof typeof ESTADOS

/** Igual que SolicitudInnovaResource.php */
export interface SolicitudInnova {
  id: number
  nombre: string
  organizacion: string | null
  correo: string
  telefono: string | null
  /** null: «otro / no estoy seguro» */
  servicio: string | null
  descripcion: string
  estado: EstadoSolicitud
  respuesta: string | null
  atendida_por: string | null
  atendida_en: string | null
  recibida: string
}
