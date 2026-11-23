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
