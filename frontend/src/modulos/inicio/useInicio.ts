import { useQuery } from '@tanstack/react-query'
import { obtenerInicio } from './api'

export const CLAVE_INICIO = ['inicio']

export function useInicio() {
  return useQuery({ queryKey: CLAVE_INICIO, queryFn: obtenerInicio })
}
