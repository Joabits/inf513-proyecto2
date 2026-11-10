import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { NavLink } from 'react-router'
import type { OpcionMenu } from '@/compartido/menu/tipos'
import { IconoAbajo, IconoCerrar } from '@/compartido/ui/Iconos'
import type { UsuarioSesion } from '@/compartido/sesion/tipos'
import { useCerrarSesion } from '@/compartido/sesion/useCerrarSesion'
import { Boton } from '@/compartido/ui/Boton'
import { Buscador } from './Buscador'

function Lista({ opciones, alNavegar }: { opciones: OpcionMenu[]; alNavegar: () => void }) {
  const clase = ({ isActive }: { isActive: boolean }) =>
    `block rounded-tema px-3 py-2.5 ${isActive ? 'bg-superficie font-semibold text-acento' : 'text-texto'}`

  return (
    <ul className="space-y-0.5">
      {opciones.map((op) =>
        op.hijos.length === 0 ? (
          <li key={op.id}>
            <NavLink to={op.ruta ?? '/'} end onClick={alNavegar} className={clase}>
              {op.titulo}
            </NavLink>
          </li>
        ) : (
          <li key={op.id}>
            {/* <details> despliega el grupo sin JavaScript y funciona con teclado y lectores de pantalla */}
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between rounded-tema px-3 py-2.5 font-semibold text-titulo [&::-webkit-details-marker]:hidden">
                {op.titulo}
                <IconoAbajo width={16} height={16} className="transition-transform group-open:rotate-180" />
              </summary>
              <ul className="mb-1 ml-3 border-l-2 border-borde pl-2">
                {op.hijos.map((h) => (
                  <li key={h.id}>
                    <NavLink to={h.ruta ?? '/'} onClick={alNavegar} className={clase}>
                      {h.titulo}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </details>
          </li>
        ),
      )}
    </ul>
  )
}

/** Panel lateral del menú para celulares y tablets. */
export function MenuMovil(props: {
  abierto: boolean
  alCerrar: () => void
  publico: OpcionMenu[]
  gestion: OpcionMenu[]
  usuario: UsuarioSesion | null | undefined
}) {
  const { abierto, alCerrar } = props
  const cerrarSesion = useCerrarSesion()

  // Bloquea el scroll de la página y cierra con Escape mientras está abierto
  useEffect(() => {
    if (!abierto) return
    const cerrar = (e: KeyboardEvent) => e.key === 'Escape' && alCerrar()
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', cerrar)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', cerrar)
    }
  }, [abierto, alCerrar])

  if (!abierto) return null

  // Portal al <body>: el header tiene backdrop-blur, que encerraría al panel "fixed" dentro del header
  return createPortal(
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Menú de navegación">
      <button type="button" aria-label="Cerrar menú" onClick={alCerrar} className="absolute inset-0 bg-black/40" />
      <nav className="absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col bg-fondo shadow-2xl">
        <div className="flex h-16 items-center justify-between border-b border-borde px-4">
          <span className="font-titulos font-bold text-titulo">Menú</span>
          <button type="button" onClick={alCerrar} aria-label="Cerrar menú" className="grid h-10 w-10 place-items-center rounded-full hover:bg-superficie">
            <IconoCerrar />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-4">
          <Buscador id="buscar-movil" alBuscar={alCerrar} />
          <Lista opciones={props.publico} alNavegar={alCerrar} />
          {props.gestion.length > 0 && (
            <div>
              <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-texto-suave">Gestión</p>
              <Lista opciones={props.gestion} alNavegar={alCerrar} />
            </div>
          )}
        </div>

        {props.usuario && (
          <div className="border-t border-borde p-4">
            <p className="text-sm">
              <span className="font-semibold">{props.usuario.nombre}</span>
              <span className="block text-texto-suave">{props.usuario.rol?.nombre}</span>
            </p>
            <Boton
              variante="borde"
              disabled={cerrarSesion.isPending}
              onClick={() => {
                cerrarSesion.mutate()
                alCerrar()
              }}
              className="mt-3 w-full text-sm"
            >
              Cerrar sesión
            </Boton>
          </div>
        )}
      </nav>
    </div>,
    document.body,
  )
}
