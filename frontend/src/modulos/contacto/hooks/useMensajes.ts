import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { atenderMensaje, eliminarMensaje, getMensajes } from '../api/contacto'

export const CLAVE_MENSAJES = ['mensajes']

export function useMensajes() {
  return useQuery({
    queryKey: CLAVE_MENSAJES,
    queryFn: getMensajes,
  })
}

/** Marca como atendido (con nota) o devuelve a pendiente con atendido: false. */
export function useAtenderMensaje() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, respuesta, atendido = true }: { id: number; respuesta?: string | null; atendido?: boolean }) =>
      atenderMensaje(id, respuesta, atendido),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLAVE_MENSAJES })
    },
  })
}

export function useEliminarMensaje() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => eliminarMensaje(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLAVE_MENSAJES })
    },
  })
}
