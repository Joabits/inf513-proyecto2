import { useMutation, useQueryClient } from '@tanstack/react-query'
import { iniciarSesion } from './api'

export function useIniciarSesion() {
  const consultas = useQueryClient()

  return useMutation({
    mutationFn: iniciarSesion,
    onSuccess: () =>
      Promise.all([
        consultas.invalidateQueries({ queryKey: ['sesion'] }),
        consultas.invalidateQueries({ queryKey: ['menu'] }),
      ]),
  })
}
