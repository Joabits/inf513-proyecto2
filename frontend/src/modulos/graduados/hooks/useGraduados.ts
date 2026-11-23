import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  actualizarGraduado,
  crearGraduado,
  eliminarGraduado,
  getGraduados,
  getGraduadosPublicos,
} from '../api/graduados'
import type { GraduadoFormValores } from '../esquema/graduadoSchema'

export const CLAVE_GRADUADOS = ['graduados']
export const CLAVE_GRADUADOS_PUBLICOS = ['graduados-publicos']

export function useGraduadosPublicos() {
  return useQuery({
    queryKey: CLAVE_GRADUADOS_PUBLICOS,
    queryFn: getGraduadosPublicos,
  })
}

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
      queryClient.invalidateQueries({ queryKey: CLAVE_GRADUADOS_PUBLICOS })
    },
  })
}

export function useActualizarGraduado() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: GraduadoFormValores }) => actualizarGraduado(id, datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLAVE_GRADUADOS })
      queryClient.invalidateQueries({ queryKey: CLAVE_GRADUADOS_PUBLICOS })
    },
  })
}

export function useEliminarGraduado() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => eliminarGraduado(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLAVE_GRADUADOS })
      queryClient.invalidateQueries({ queryKey: CLAVE_GRADUADOS_PUBLICOS })
    },
  })
}
