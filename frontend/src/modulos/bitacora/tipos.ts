/** Igual que RegistroResource.php */
export interface Registro {
  id: number
  fecha: string
  tipo: 'accion' | 'auditoria' | 'ingreso_ok' | 'ingreso_fallido' | 'salida' | 'acceso'
  accion: string | null
  recurso: string | null
  detalle: string | null
  cambios: Record<string, { antes: unknown; despues: unknown }> | null
  usuario: string | null
  nombre: string | null
  cuenta_eliminada: boolean
  ip: string | null
  navegador: string | null
  codigo_http: number | null
}

/** Paginación de Laravel (solo lo que usa la pantalla) */
export interface PaginaBitacora {
  data: Registro[]
  meta: { current_page: number; last_page: number; total: number; from: number | null; to: number | null }
}

export type Grupo = 'auditoria' | 'sesiones' | 'accesos'

export interface FiltrosBitacora {
  grupo: Grupo
  usuario: string
  accion: string
  texto: string
  desde: string
  hasta: string
  resultado: string
}

export const FILTROS_VACIOS: FiltrosBitacora = { grupo: 'auditoria', usuario: '', accion: '', texto: '', desde: '', hasta: '', resultado: '' }

/** Igual que BitacoraService::opciones() */
export interface OpcionesBitacora {
  grupos: { valor: Grupo; etiqueta: string }[]
  resultados: { valor: string; etiqueta: string }[]
  usuarios: string[]
  acciones: string[]
}
