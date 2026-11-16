import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { actualizarEvento, crearEvento, eliminarEvento, getEvento, getEventos } from '../api/eventos'
import type { EventoEntrada } from '../tipos'

export function useEventos(soloPublicados?: boolean) {
  return useQuery({
    queryKey: ['eventos', { soloPublicados }],
    queryFn: () => getEventos(soloPublicados),
  })
}

export function useEvento(id: number) {
  return useQuery({
    queryKey: ['eventos', id],
    queryFn: () => getEvento(id),
    enabled: !!id,
  })
}

export function useCrearEvento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (datos: EventoEntrada) => crearEvento(datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] })
    },
    onError: (error: any) => {
      console.error('Error al guardar', error.response?.data)
      const mensaje = error.response?.data?.message || 'Error al guardar el evento'
      if (typeof window !== 'undefined' && error.response?.status === 422) {
        alert(mensaje)
      }
    },
  })
}

export function useActualizarEvento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: Partial<EventoEntrada> }) => actualizarEvento(id, datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] })
    },
    onError: (error: any) => {
      console.error('Error al actualizar', error.response?.data)
      const mensaje = error.response?.data?.message || 'Error al actualizar el evento'
      if (typeof window !== 'undefined' && error.response?.status === 422) {
        alert(mensaje)
      }
    },
  })
}

export function useEliminarEvento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => eliminarEvento(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] })
    },
  })
}
