import { useCallback, useRef, useState } from 'react'
import { NavLink } from 'react-router'
import type { OpcionMenu } from '@/compartido/menu/tipos'
import type { UsuarioSesion } from '@/compartido/sesion/tipos'
import { useCerrarSesion } from '@/compartido/sesion/useCerrarSesion'
import { Boton } from '@/compartido/ui/Boton'
import { IconoAbajo, IconoUsuario } from '@/compartido/ui/Iconos'
import { useClicFuera } from '@/compartido/ui/useClicFuera'

/**
 * Botón del usuario con sesión iniciada: muestra su nombre, su rol, el menú de gestión
 * que le permite la matriz de acceso y la opción de cerrar sesión.
 */
export function MenuUsuario({ usuario, gestion }: { usuario: UsuarioSesion; gestion: OpcionMenu[] }) {
  const [abierto, setAbierto] = useState(false)
  const caja = useRef<HTMLDivElement>(null)
  const cerrar = useCallback(() => setAbierto(false), [])
  const cerrarSesion = useCerrarSesion()
  useClicFuera(caja, abierto, cerrar)

  return (
    <div className="relative" ref={caja}>
      <button
        type="button"
        aria-expanded={abierto}
        aria-label={`Menú de ${usuario.nombre}`}
        onClick={() => setAbierto(!abierto)}
        title="Gestión"
        className="flex h-10 items-center gap-1 rounded-full border border-borde pl-1 pr-2 text-titulo transition-colors hover:border-titulo"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-superficie">
          <IconoUsuario width={16} height={16} />
        </span>
        <IconoAbajo width={14} height={14} className={`transition-transform ${abierto ? 'rotate-180' : ''}`} />
      </button>

      {abierto && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(34rem,calc(100vw-2rem))] rounded-tema border border-borde bg-fondo p-5 text-texto shadow-xl">
          <p className="text-xs font-bold uppercase tracking-wider text-texto-suave">Gestión</p>
          <p className="mt-2 font-semibold text-titulo">{usuario.nombre}</p>
          <p className="text-sm text-texto-suave">{usuario.rol?.nombre}</p>

          {gestion.length > 0 && (
            <div className="mt-4 grid gap-5 border-t border-borde pt-4 sm:grid-cols-2">
              {gestion.map((grupo) => (
                <div key={grupo.id}>
                  <p className="mb-1 px-2 text-xs font-bold uppercase tracking-wider text-texto-suave">{grupo.titulo}</p>
                  <ul>
                    {grupo.hijos.map((h) => (
                      <li key={h.id}>
                        <NavLink
                          to={h.ruta ?? '/'}
                          onClick={cerrar}
                          className={({ isActive }) =>
                            `block rounded-tema px-2 py-1.5 text-sm transition-colors hover:bg-superficie ${
                              isActive ? 'font-semibold text-acento' : 'text-texto'
                            }`
                          }
                        >
                          {h.titulo}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 border-t border-borde pt-4">
            <Boton variante="borde" disabled={cerrarSesion.isPending} onClick={() => cerrarSesion.mutate()} className="w-full text-sm">
              Cerrar sesión
            </Boton>
          </div>
        </div>
      )}
    </div>
  )
}
