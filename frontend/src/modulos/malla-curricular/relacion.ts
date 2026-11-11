/** Cómo se relaciona una materia con la que eligió el visitante. */
export type Relacion = 'elegida' | 'requisito' | 'habilita' | 'atenuada' | 'normal'

/** Estilo de cada relación. Solo colores del tema; la relación también se dice con texto. */
export const ESTILO_RELACION: Record<Relacion, string> = {
  elegida: 'border-primario bg-primario text-sobre-primario',
  requisito: 'border-2 border-primario bg-fondo',
  habilita: 'border-marino bg-marino text-sobre-primario',
  atenuada: 'border-borde bg-fondo opacity-35',
  normal: 'border-borde bg-fondo hover:border-titulo',
}
