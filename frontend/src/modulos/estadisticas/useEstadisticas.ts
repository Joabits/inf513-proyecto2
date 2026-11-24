import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { obtenerEstadisticas } from './api'
import type { Periodo } from './tipos'

export function useEstadisticas(dias: Periodo) {
  return useQuery({
    queryKey: ['estadisticas', dias],
    queryFn: () => obtenerEstadisticas(dias),
    // Al cambiar de periodo se siguen viendo los datos anteriores hasta que llegan los nuevos
    placeholderData: keepPreviousData,
  })
}
