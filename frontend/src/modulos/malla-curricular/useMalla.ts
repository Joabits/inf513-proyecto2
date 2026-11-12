import { useQuery } from '@tanstack/react-query'
import { cliente } from '@/compartido/api/cliente'
import type { Malla } from './tipos'

/** El plan de estudios cambia muy pocas veces: se pide una vez por visita. */
export function useMalla() {
  return useQuery({
    queryKey: ['malla-curricular'],
    queryFn: () => cliente.get<Malla>('/malla-curricular').then((r) => r.data),
    staleTime: 30 * 60_000,
  })
}
