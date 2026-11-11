/** Igual que MallaService::malla() */
export interface MateriaMalla {
  sigla: string
  nombre: string
  horas_teoricas: number | null
  horas_practicas: number | null
  creditos: number | null
  /** Opción de graduación del último semestre: el estudiante elige una sola */
  optativa: boolean
  /** Siglas de las materias que hay que aprobar antes */
  prerrequisitos: string[]
  /** Siglas de las materias que esta habilita */
  habilita: string[]
}

export interface SemestreMalla {
  numero: number
  materias: MateriaMalla[]
  totales: { horas_teoricas: number; horas_practicas: number; creditos: number }
}

export interface PlanEstudios {
  codigo: string
  nivel: string
  sistema: string
  semestres: number
  /** Una titulación intermedia por línea */
  titulaciones: string | null
  nota_graduacion: string | null
  total_materias: number
  total_creditos: number
}

export interface Malla {
  plan: PlanEstudios | null
  semestres: SemestreMalla[]
}
