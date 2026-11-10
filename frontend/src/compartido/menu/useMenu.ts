import { useQuery } from '@tanstack/react-query'
import { cliente } from '@/compartido/api/cliente'
import type { MenuRespuesta } from './tipos'

/** Menú dinámico guardado en la BD (requisito 2). Cambia según el rol de la sesión. */
export function useMenu() {
  return useQuery({
    queryKey: ['menu'],
    queryFn: () => cliente.get<MenuRespuesta>('/menu').then((r) => r.data),
    staleTime: 5 * 60_000,
  })
}
