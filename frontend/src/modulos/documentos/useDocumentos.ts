import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cambiarPublicacion, crearCategoria, eliminarDocumento, listarCategorias, listarDocumentos, listarVersiones } from './api'
import type { Categoria, Documento } from './tipos'

export const CLAVE_DOCUMENTOS = ['documentos']
const CLAVE_CATEGORIAS = ['documentos-categorias']

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

export function useCategorias() {
  return useQuery({ queryKey: CLAVE_CATEGORIAS, queryFn: listarCategorias, staleTime: Infinity })
}

/** La categoría nueva se agrega a la lista en orden alfabético, sin volver a pedirla. */
export function useCrearCategoria() {
  const consultas = useQueryClient()

  return useMutation({
    mutationFn: crearCategoria,
    onSuccess: (nueva) =>
      consultas.setQueryData<Categoria[]>(CLAVE_CATEGORIAS, (lista = []) =>
        [...lista, nueva].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
      ),
  })
}

/** Reemplaza solo ese documento en la lista: el resto no se vuelve a pedir. */
export function useCambiarPublicacion() {
  const consultas = useQueryClient()

  return useMutation({
    mutationFn: ({ id, publicado }: { id: number; publicado: boolean }) => cambiarPublicacion(id, publicado),
    onSuccess: (cambiado) =>
      consultas.setQueryData<Documento[]>(CLAVE_DOCUMENTOS, (lista) => lista?.map((documento) => (documento.id === cambiado.id ? cambiado : documento))),
  })
}
