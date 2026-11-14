import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { buscar } from './api'

/** Igual que BuscarRequest: menos de 3 caracteres no se envía. */
export const MINIMO = 3
export const MAXIMO = 80

export function useBusqueda(q: string, tipo: string | null) {
  const consulta = q.trim()

  return useQuery({
    queryKey: ['busqueda', consulta, tipo],
    queryFn: () => buscar(consulta, tipo),
    enabled: consulta.length >= MINIMO,
    // Al cambiar de pestaña o afinar la búsqueda, los resultados anteriores quedan hasta que llegan los nuevos
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  })
}
