import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cambiarPublicacion, eliminarArticulo, eliminarEdicion, obtenerGestion, obtenerPublica, ordenarArticulos } from './api'
import type { ContenidoCompleto } from './tipos'

const CLAVE_PUBLICA = ['revista-publica']
const CLAVE_GESTION = ['revista-gestion']

export function useRevistaPublica() {
  return useQuery({ queryKey: CLAVE_PUBLICA, queryFn: obtenerPublica })
}

export function useRevistaGestion() {
  return useQuery({ queryKey: CLAVE_GESTION, queryFn: obtenerGestion })
}

/**
 * Toda edición devuelve la revista completa del panel: se deja en caché y la vista se actualiza sin otra petición.
 * La vista pública se marca como vencida para que el visitante vea el cambio.
 */
export function useGuardarRevista<T>(guardar: (datos: T) => Promise<ContenidoCompleto>) {
  const consultas = useQueryClient()

  return useMutation({
    mutationFn: guardar,
    onSuccess: (contenido) => {
      consultas.setQueryData(CLAVE_GESTION, contenido)
      void consultas.invalidateQueries({ queryKey: CLAVE_PUBLICA })
    },
  })
}

export const useCambiarPublicacion = () =>
  useGuardarRevista(({ id, publicada }: { id: number; publicada: boolean }) => cambiarPublicacion(id, publicada))

export const useEliminarEdicion = () => useGuardarRevista(eliminarEdicion)

export const useEliminarArticulo = () => useGuardarRevista(eliminarArticulo)

export const useOrdenarArticulos = () => useGuardarRevista(({ edicion, ids }: { edicion: number; ids: number[] }) => ordenarArticulos(edicion, ids))
