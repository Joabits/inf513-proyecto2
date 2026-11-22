import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  actualizarGaleria,
  crearGaleria,
  eliminarGaleria,
  getGaleria,
  getGaleriaItem,
} from '../api/galeria'

export const CLAVE_GALERIA = ['galeria']

export function useGaleria(params?: { publicadas?: boolean }) {
  return useQuery({
    queryKey: [...CLAVE_GALERIA, params],
    queryFn: () => getGaleria(params),
  })
}

export function useGaleriaItem(id: number) {
  return useQuery({
    queryKey: [...CLAVE_GALERIA, id],
    queryFn: () => getGaleriaItem(id),
    enabled: Number.isFinite(id) && id > 0,
  })
}

export function useCrearGaleria() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (datos: FormData) => crearGaleria(datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLAVE_GALERIA })
    },
  })
}

export function useActualizarGaleria() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: FormData }) =>
      actualizarGaleria(id, datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLAVE_GALERIA })
    },
  })
}

export function useEliminarGaleria() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => eliminarGaleria(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLAVE_GALERIA })
    },
  })
}
