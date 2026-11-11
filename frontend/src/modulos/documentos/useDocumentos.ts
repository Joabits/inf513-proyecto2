import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { eliminarDocumento, listarDocumentos, listarVersiones } from './api'
import type { Documento } from './tipos'

export const CLAVE_DOCUMENTOS = ['documentos']

export function useDocumentos() {
  return useQuery({ queryKey: CLAVE_DOCUMENTOS, queryFn: listarDocumentos })
}

/** El historial se pide solo cuando alguien lo abre. */
export function useVersiones(id: number, abierto: boolean) {
  return useQuery({ queryKey: [...CLAVE_DOCUMENTOS, id, 'versiones'], queryFn: () => listarVersiones(id), enabled: abierto })
}

/** Crear y editar refrescan la lista (y el historial, que cuelga de la misma clave). */
export function useGuardarDocumento(guardar: (datos: FormData) => Promise<Documento>) {
  const consultas = useQueryClient()

  return useMutation({
    mutationFn: guardar,
    onSuccess: () => consultas.invalidateQueries({ queryKey: CLAVE_DOCUMENTOS }),
  })
}

export function useEliminarDocumento() {
  const consultas = useQueryClient()

  return useMutation({
    mutationFn: eliminarDocumento,
    onSuccess: (_respuesta, id) =>
      consultas.setQueryData<Documento[]>(CLAVE_DOCUMENTOS, (lista) => lista?.filter((documento) => documento.id !== id)),
  })
}
