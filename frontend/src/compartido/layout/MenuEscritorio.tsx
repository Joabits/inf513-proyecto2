import type { Ref } from 'react'
import { NavLink } from 'react-router'
import { iconoDeRuta } from '@/compartido/menu/iconosRuta'
import type { OpcionMenu } from '@/compartido/menu/tipos'
import { IconoAbajo } from '@/compartido/ui/Iconos'

/** Quita el foco al navegar, para que el submenú abierto con el teclado se cierre. */
const soltarFoco = () => (document.activeElement as HTMLElement | null)?.blur()

const claseEnlace = ({ isActive }: { isActive: boolean }) =>
  `relative flex h-18 items-center px-2 text-[0.8125rem] font-semibold whitespace-nowrap transition-colors hover:text-acento ${
    isActive ? 'text-acento after:absolute after:inset-x-2 after:bottom-4.5 after:h-0.5 after:rounded-full after:bg-primario' : 'text-titulo'
  }`

/**
 * Menú dinámico (de la BD) para pantallas grandes, en la misma fila que el logo.
 * Los submenús se abren al pasar el mouse o con el teclado (focus-within), sin JavaScript extra.
 */
export const MenuEscritorio = ({ opciones, ref }: { opciones: OpcionMenu[]; ref?: Ref<HTMLUListElement> }) => {
  return (
    <ul ref={ref} className="flex w-max items-center">
      {opciones.map((op) =>
        op.hijos.length === 0 ? (
          <li key={op.id}>
            <NavLink to={op.ruta ?? '/'} end className={claseEnlace} onClick={soltarFoco}>
              {op.titulo}
            </NavLink>
          </li>
        ) : (
          <li key={op.id} className="group relative">
            <button
              type="button"
              aria-haspopup="true"
              className="flex h-18 items-center gap-0.5 px-2 text-[0.8125rem] font-semibold whitespace-nowrap text-titulo transition-colors hover:text-acento group-focus-within:text-acento"
            >
              {op.titulo}
              <IconoAbajo width={13} height={13} className="transition-transform group-hover:rotate-180 group-focus-within:rotate-180" />
            </button>
            <ul className="invisible absolute left-0 top-full z-40 min-w-64 -translate-y-1 rounded-tema border border-borde bg-fondo p-2 opacity-0 sombra-elevada transition group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              {op.hijos.map((h) => {
                const Icono = iconoDeRuta(h.ruta)
                return (
                  <li key={h.id}>
                    <NavLink
                      to={h.ruta ?? '/'}
                      onClick={soltarFoco}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-tema px-3 py-2.5 text-sm transition-colors hover:bg-superficie hover:text-acento ${
                          isActive ? 'font-semibold text-acento' : 'text-texto'
                        }`
                      }
                    >
                      {Icono && <Icono width={18} height={18} aria-hidden="true" className="shrink-0 text-acento" />}
                      {h.titulo}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </li>
        ),
      )}
    </ul>
  )
}
