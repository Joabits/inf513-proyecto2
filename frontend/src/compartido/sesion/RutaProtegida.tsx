import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { EstadoCarga } from '@/compartido/ui/EstadoCarga'
import type { SlugRol } from './tipos'
import { useSesion } from './useSesion'

/**
 * Envuelve las páginas de gestión. Uso en rutas.tsx de cada módulo:
 *   <RutaProtegida roles={['director', 'editor_institucional']}><GestionX /></RutaProtegida>
 * La API también valida el rol: esto solo evita mostrar pantallas que no corresponden.
 */
export function RutaProtegida({ roles, children }: { roles: SlugRol[]; children: ReactNode }) {
  const { data: usuario, isLoading } = useSesion()
  const ubicacion = useLocation()

  if (isLoading) return <EstadoCarga />
  if (!usuario) return <Navigate to="/ingresar" replace state={{ desde: ubicacion.pathname }} />
  if (!usuario.rol || !roles.includes(usuario.rol.slug)) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <h1 className="text-2xl font-bold">Acceso no permitido</h1>
        <p className="mt-2 text-texto-suave">Su rol no tiene permiso para ver esta página.</p>
      </div>
    )
  }
  return children
}
