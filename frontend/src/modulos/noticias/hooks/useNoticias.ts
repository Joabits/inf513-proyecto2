import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  actualizarNoticia,
  crearNoticia,
  eliminarNoticia,
  getNoticia,
  getNoticias,
} from '../api/noticias'

export function useNoticias(todas = false) {
  return useQuery({
    queryKey: ['noticias', { todas }],
    queryFn: () => getNoticias(todas),
  })
}

export function useNoticia(id: number) {
  return useQuery({
    queryKey: ['noticias', id],
    queryFn: () => getNoticia(id),
    enabled: Boolean(id) && !Number.isNaN(id),
  })
}

export function useCrearNoticia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (formData: FormData) => crearNoticia(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['noticias'] })
    },
  })
}

export function useActualizarNoticia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
      actualizarNoticia(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['noticias'] })
    },
  })
}

export function useEliminarNoticia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => eliminarNoticia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['noticias'] })
    },
  })
}
