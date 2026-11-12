import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { obtenerInstitucional } from './api'
import type { InformacionInstitucional } from './tipos'

const CLAVE_INSTITUCIONAL = ['institucional']

export function useInstitucional() {
  return useQuery({ queryKey: CLAVE_INSTITUCIONAL, queryFn: obtenerInstitucional })
}

export function useGuardarInstitucional<T>(guardar: (datos: T) => Promise<InformacionInstitucional>) {
  const consultas = useQueryClient()

  return useMutation({
    mutationFn: guardar,
    onSuccess: (informacion) => consultas.setQueryData(CLAVE_INSTITUCIONAL, informacion),
  })
}
