import { cliente, RUTA_BASE } from '@/compartido/api/cliente'
import type { Documento } from '../tipos/index'

/**
 * Obtiene la lista pública de documentos de la carrera.
 * GET /api/documentos
 */
export const getDocumentos = async (): Promise<Documento[]> => {
  const { data } = await cliente.get<{ data?: Documento[] } | Documento[]>('/documentos')
  if (Array.isArray(data)) {
    return data
  }
  if (data && Array.isArray(data.data)) {
    return data.data
  }
  return []
}

/**
 * Retorna la URL para forzar la descarga del documento.
 * GET /api/documentos/{id}/descargar
 */
export const descargarDocumento = (id: number): string => {
  return `${RUTA_BASE}/api/documentos/${id}/descargar`
}
