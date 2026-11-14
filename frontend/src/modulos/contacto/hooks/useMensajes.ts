import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { atenderMensaje, getMensajes } from '../api/contacto'

export const CLAVE_MENSAJES = ['mensajes']

export function useMensajes() {
  return useQuery({
    queryKey: CLAVE_MENSAJES,
    queryFn: getMensajes,
  })
}

export function useAtenderMensaje() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, respuesta }: { id: number; respuesta?: string | null }) =>
      atenderMensaje(id, respuesta),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLAVE_MENSAJES })
    },
  })
}
