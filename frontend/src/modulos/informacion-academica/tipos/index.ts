export interface InformacionAcademica {
  id: number
  mision: string
  vision: string
  perfil_profesional: string
  objetivos: string
  autor: string | null
  actualizado_en: string | null
}

export type DatosInformacion = Pick<InformacionAcademica, 'mision' | 'vision' | 'perfil_profesional' | 'objetivos'>

/** Lo que muestra la página del plan de estudios vigente (sale de la malla curricular, CU-02). */
export interface PlanEstudios {
  codigo: string
  nivel: string
  sistema: string
  semestres: number
  titulaciones: string | null
  total_materias: number
  total_creditos: number
}
