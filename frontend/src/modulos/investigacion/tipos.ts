/** Igual que Proyecto::TIPOS y Proyecto::ESTADOS */
export const TIPOS = {
  investigacion: 'Proyecto de investigación',
  aula: 'Proyecto de Investigación en Aula (PIA)',
  semillero: 'Proyecto de semillero',
} as const

export const ESTADOS = { en_curso: 'En curso', concluido: 'Concluido' } as const

export type TipoProyecto = keyof typeof TIPOS
export type EstadoProyecto = keyof typeof ESTADOS

/** Igual que ProyectoResource.php */
export interface Proyecto {
  id: number
  titulo: string
  tipo: TipoProyecto
  linea: { id: number; nombre: string } | null
  responsable: string
  integrantes: string | null
  gestion: number
  estado: EstadoProyecto
  resumen: string
  publicado: boolean
  editado_por?: string | null
  actualizado: string
}

/** Igual que LineaResource.php */
export interface Linea {
  id: number
  nombre: string
  descripcion: string
  /** Cantidad de proyectos de la línea */
  proyectos: number
}

export interface ContenidoInvestigacion {
  semilleros_presentacion: string | null
  semilleros_mision: string | null
  semilleros_vision: string | null
  /** Un objetivo por línea */
  semilleros_objetivos: string | null
  semilleros_coordinador: string | null
  pia_presentacion: string | null
  instituto: string | null
}

export interface Semillero {
  nombre: string
  descripcion: string | null
}

export interface Complementos {
  contenido: ContenidoInvestigacion | null
  semilleros: Semillero[]
}

/** Igual que InvestigacionController::gestion() */
export interface GestionInvestigacion extends Complementos {
  proyectos: Proyecto[]
  lineas: Linea[]
}

/** Igual que InvestigacionController::publica(): solo proyectos publicados */
export interface InvestigacionPublica extends Complementos {
  proyectos: Proyecto[]
  lineas: Linea[]
}
