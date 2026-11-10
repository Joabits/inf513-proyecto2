import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { EstadoCarga } from '@/compartido/ui/EstadoCarga'
import { useSesion } from './useSesion'

/**
 * Envuelve las páginas de gestión. Uso en rutas.tsx de cada módulo:
 *   <RutaProtegida permiso="noticias.ver"><GestionNoticias /></RutaProtegida>
 * La API también valida el permiso: esto solo evita mostrar pantallas que no corresponden.
 */
export function RutaProtegida({ permiso, children }: { permiso: string; children: ReactNode }) {
  const { data: usuario, isLoading } = useSesion()
  const ubicacion = useLocation()

  if (isLoading) return <EstadoCarga />
  if (!usuario) return <Navigate to="/gestion/ingresar" replace state={{ desde: ubicacion.pathname }} />
  if (!usuario.permisos.includes(permiso)) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <h1 className="text-2xl font-bold">Acceso no permitido</h1>
        <p className="mt-2 text-texto-suave">Su rol no tiene permiso para ver esta página.</p>
      </div>
    )
  }
  return children
}
