import { useState } from 'react'
import { NavLink } from 'react-router'
import type { OpcionMenu } from '@/compartido/menu/tipos'

/** Dibuja el menú que viene de la BD. Los grupos se despliegan con el mouse, el teclado o un toque. */
export function MenuDinamico({ opciones, alNavegar }: { opciones: OpcionMenu[]; alNavegar?: () => void }) {
  const [abierto, setAbierto] = useState<number | null>(null)

  const claseEnlace = ({ isActive }: { isActive: boolean }) =>
    `block rounded-tema px-3 py-2 text-sm font-semibold transition ${
      isActive ? 'bg-primario text-sobre-primario' : 'hover:bg-white/10'
    }`

  return (
    <ul className="flex flex-col gap-1 lg:flex-row lg:flex-wrap lg:items-center">
      {opciones.map((op) =>
        op.hijos.length === 0 ? (
          <li key={op.id}>
            <NavLink to={op.ruta ?? '/'} end className={claseEnlace} onClick={alNavegar}>
              {op.titulo}
            </NavLink>
          </li>
        ) : (
          <li
            key={op.id}
            className="relative"
            onMouseEnter={() => setAbierto(op.id)}
            onMouseLeave={() => setAbierto(null)}
          >
            <button
              type="button"
              aria-expanded={abierto === op.id}
              onClick={() => setAbierto(abierto === op.id ? null : op.id)}
              className="flex w-full items-center justify-between gap-1 rounded-tema px-3 py-2 text-sm font-semibold hover:bg-white/10"
            >
              {op.titulo} <span aria-hidden="true">▾</span>
            </button>
            {abierto === op.id && (
              <ul className="z-40 min-w-56 rounded-tema border border-borde bg-fondo py-1 text-texto shadow-lg lg:absolute lg:left-0 lg:top-full">
                {op.hijos.map((h) => (
                  <li key={h.id}>
                    <NavLink
                      to={h.ruta ?? '/'}
                      onClick={() => {
                        setAbierto(null)
                        alNavegar?.()
                      }}
                      className={({ isActive }) =>
                        `block px-4 py-2 text-sm hover:bg-superficie ${isActive ? 'font-bold text-acento' : ''}`
                      }
                    >
                      {h.titulo}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ),
      )}
    </ul>
  )
}
