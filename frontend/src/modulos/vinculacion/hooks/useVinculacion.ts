import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  actualizarVinculacion,
  crearVinculacion,
  eliminarVinculacion,
  getVinculaciones,
} from '../api/vinculacion'

export const CLAVE_VINCULACIONES = ['vinculaciones']

export function useVinculaciones(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [...CLAVE_VINCULACIONES, params],
    queryFn: () => getVinculaciones(params),
  })
}

export function useCrearVinculacion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (datos: FormData) => crearVinculacion(datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLAVE_VINCULACIONES })
    },
  })
}

export function useActualizarVinculacion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: FormData }) =>
      actualizarVinculacion(id, datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLAVE_VINCULACIONES })
    },
  })
}

export function useEliminarVinculacion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => eliminarVinculacion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLAVE_VINCULACIONES })
    },
  })
}
