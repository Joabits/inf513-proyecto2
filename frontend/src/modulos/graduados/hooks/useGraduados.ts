import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { actualizarGraduado, crearGraduado, eliminarGraduado, getGraduados } from '../api/graduados'
import type { GraduadoFormValores } from '../esquema/graduadoSchema'

export const CLAVE_GRADUADOS = ['graduados']

export function useGraduados() {
  return useQuery({
    queryKey: CLAVE_GRADUADOS,
    queryFn: getGraduados,
  })
}

export function useCrearGraduado() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (datos: GraduadoFormValores) => crearGraduado(datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLAVE_GRADUADOS })
    },
  })
}

export function useActualizarGraduado() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: GraduadoFormValores }) => actualizarGraduado(id, datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLAVE_GRADUADOS })
    },
  })
}

export function useEliminarGraduado() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => eliminarGraduado(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLAVE_GRADUADOS })
    },
  })
}
