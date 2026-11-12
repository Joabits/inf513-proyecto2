/** Igual que InstitucionalController::mostrar() */
export interface ContenidoInstitucional {
  presentacion: string
  /** Texto sin HTML: una línea en blanco separa cada párrafo */
  resena_historica: string
  mision: string
  vision: string
  perfil_profesional: string
  campo_ocupacional: string
  /** AAAA-MM-DD */
  fecha_creacion: string | null
  resolucion: string | null
  acreditacion: string | null
  actualizado: string | null
}

export interface Hito {
  anio: number
  titulo: string
  descripcion: string | null
}

export interface InformacionInstitucional {
  contenido: ContenidoInstitucional | null
  hitos: Hito[]
}
