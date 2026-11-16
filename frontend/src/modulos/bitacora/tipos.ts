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
  /** Sección del panel a la que apuntaba un acceso denegado («Usuarios») */
  seccion: string | null
}

/** Paginación de Laravel (solo lo que usa la pantalla) */
export interface PaginaBitacora {
  data: Registro[]
  meta: { current_page: number; last_page: number; total: number; from: number | null; to: number | null }
}

/** «accesos» es el registro técnico: existe en el servidor pero la pantalla no lo ofrece. */
export type Grupo = 'auditoria' | 'sesiones' | 'denegados'

export interface FiltrosBitacora {
  grupo: Grupo
  usuario: string
  accion: string
  /** «» = todo; «importantes» = lo que borra datos o cambia permisos, y los ingresos fallidos */
  importancia: '' | 'importantes'
  texto: string
  desde: string
  hasta: string
}

export const FILTROS_VACIOS: FiltrosBitacora = { grupo: 'auditoria', usuario: '', accion: '', importancia: '', texto: '', desde: '', hasta: '' }

/** Igual que BitacoraService::opciones() */
export interface OpcionesBitacora {
  grupos: { valor: Grupo; etiqueta: string }[]
  usuarios: string[]
  acciones: string[]
}
