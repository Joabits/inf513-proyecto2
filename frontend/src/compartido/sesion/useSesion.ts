import { useQuery } from '@tanstack/react-query'
import { cliente } from '@/compartido/api/cliente'
import type { UsuarioSesion } from './tipos'

/**
 * Usuario con sesión iniciada, o null si es un visitante.
 * El inicio y cierre de sesión los implementa el módulo de autenticación (CU-11);
 * después de iniciar o cerrar sesión debe invalidar las consultas ['sesion'] y ['menu'].
 */
export function useSesion() {
  return useQuery({
    queryKey: ['sesion'],
    queryFn: () => cliente.get<{ usuario: UsuarioSesion | null }>('/sesion').then((r) => r.data.usuario),
    staleTime: 5 * 60_000,
  })
}
