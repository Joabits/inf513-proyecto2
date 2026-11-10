import { NavLink } from 'react-router'
import type { OpcionMenu } from '@/compartido/menu/tipos'
import { IconoAbajo } from '@/compartido/ui/Iconos'

/** Quita el foco al navegar, para que el submenú abierto con el teclado se cierre. */
const soltarFoco = () => (document.activeElement as HTMLElement | null)?.blur()

const claseEnlace = ({ isActive }: { isActive: boolean }) =>
  `relative flex h-12 items-center px-3 text-sm font-semibold transition-colors hover:text-acento ${
    isActive ? 'text-acento after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-primario' : 'text-titulo'
  }`

/**
 * Menú dinámico (de la BD) para pantallas grandes.
 * Los submenús se abren al pasar el mouse o con el teclado (focus-within), sin JavaScript extra.
 */
export function MenuEscritorio({ opciones, alineacion = 'izquierda' }: { opciones: OpcionMenu[]; alineacion?: 'izquierda' | 'derecha' }) {
  return (
    <ul className="flex items-center">
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
              className="flex h-12 items-center gap-1 px-3 text-sm font-semibold text-titulo transition-colors hover:text-acento group-focus-within:text-acento"
            >
              {op.titulo}
              <IconoAbajo width={14} height={14} className="transition-transform group-hover:rotate-180 group-focus-within:rotate-180" />
            </button>
            <ul
              className={`invisible absolute top-full z-40 min-w-60 translate-y-1 rounded-tema border border-borde bg-fondo p-1.5 opacity-0 shadow-lg transition group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 ${
                alineacion === 'derecha' ? 'right-0' : 'left-0'
              }`}
            >
              {op.hijos.map((h) => (
                <li key={h.id}>
                  <NavLink
                    to={h.ruta ?? '/'}
                    onClick={soltarFoco}
                    className={({ isActive }) =>
                      `block rounded-tema px-3 py-2 text-sm transition-colors hover:bg-superficie ${
                        isActive ? 'font-semibold text-acento' : 'text-texto'
                      }`
                    }
                  >
                    {h.titulo}
                  </NavLink>
                </li>
              ))}
            </ul>
          </li>
        ),
      )}
    </ul>
  )
}
