import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router'
import { MarcaCarrera } from '@/compartido/marca/LogoCarrera'
import { iconoDeRuta } from '@/compartido/menu/iconosRuta'
import type { OpcionMenu } from '@/compartido/menu/tipos'

const claseEnlace = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-tema px-3 py-2 text-sm transition-colors ${
    isActive ? 'bg-primario font-semibold text-sobre-primario' : 'text-texto hover:bg-superficie hover:text-titulo'
  }`

/**
 * Barra lateral del panel, con las opciones que permite el rol. Sigue el modo: mismo fondo que la página.
 * La cuenta (Mi perfil, cerrar sesión) está en el menú de perfil de la barra superior.
 * accion: botón a la derecha del logo (ocultar el menú en PC, cerrarlo en celular).
 */
export function BarraGestion({ grupos, alNavegar, accion }: { grupos: OpcionMenu[]; alNavegar?: () => void; accion?: ReactNode }) {
  return (
    <div className="flex h-full flex-col border-r border-borde-tarjeta bg-fondo text-texto">
      {/* Misma altura que la barra superior: el logo y los botones quedan en una sola línea */}
      <div className="flex h-16 shrink-0 items-center justify-between gap-2 pl-5 pr-3 lg:h-18">
        {/* El logo lleva al inicio del panel: no hace falta una opción «Panel» en el menú */}
        <Link to="/gestion" onClick={alNavegar} aria-label="Ir al inicio del panel de gestión" className="inline-block">
          <MarcaCarrera />
        </Link>
        {accion}
      </div>

      <nav aria-label="Menú de gestión" className="flex-1 space-y-6 overflow-y-auto px-3 pb-6 pt-3">
        {grupos.map((grupo) => (
          <div key={grupo.id}>
            <p className="mb-1.5 px-3 text-[0.7rem] font-bold uppercase tracking-widest text-texto-suave">{grupo.titulo}</p>
            <ul className="space-y-0.5">
              {grupo.hijos.map((opcion) => {
                const Icono = iconoDeRuta(opcion.ruta)
                return (
                  <li key={opcion.id}>
                    <NavLink to={opcion.ruta ?? '/gestion'} onClick={alNavegar} className={claseEnlace}>
                      {Icono ? <Icono width={18} height={18} aria-hidden="true" className="shrink-0" /> : <span className="w-[18px]" />}
                      <span className="truncate">{opcion.titulo}</span>
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  )
}
