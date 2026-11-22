import { useQuery } from '@tanstack/react-query'
import { getDocumentos } from '../api/documentos'

export const CLAVE_DOCUMENTOS = ['documentos-publicos']

/**
 * Hook para consultar los documentos públicos de la carrera mediante TanStack Query.
 */
export function useDocumentos() {
  return useQuery({
    queryKey: CLAVE_DOCUMENTOS,
    queryFn: getDocumentos,
  })
}
