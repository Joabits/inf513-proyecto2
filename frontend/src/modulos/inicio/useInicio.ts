import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { obtenerInicio } from './api'
import type { ContenidoInicio } from './tipos'

export const CLAVE_INICIO = ['inicio']

export function useInicio() {
  return useQuery({ queryKey: CLAVE_INICIO, queryFn: obtenerInicio })
}

/** Toda edición devuelve la portada completa: se guarda en caché y la vista se actualiza sin otra petición. */
export function useGuardarInicio<T>(guardar: (datos: T) => Promise<ContenidoInicio>) {
  const consultas = useQueryClient()

  return useMutation({
    mutationFn: guardar,
    onSuccess: (contenido) => consultas.setQueryData(CLAVE_INICIO, contenido),
  })
}
