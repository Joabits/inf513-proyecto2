import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router'
import { MarcaCarrera } from '@/compartido/marca/LogoCarrera'
import { iconoDeRuta } from '@/compartido/menu/iconosRuta'
import type { OpcionMenu } from '@/compartido/menu/tipos'

// La opción de la página actual no lleva fondo, ni al pasar el mouse: se marca con el color del texto y del ícono.
// text-acento es rojo de día; de noche y en alto contraste cambia para que el texto se lea bien.
const claseEnlace = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-tema px-3 py-2 text-sm transition-colors ${
    isActive ? 'font-semibold text-acento' : 'text-texto hover:bg-superficie hover:text-titulo'
  }`

/**
 * Fila de arriba del menú lateral: logo y un botón a la derecha. Tiene la altura de la barra superior.
 * La plantilla del panel la repite en la barra superior cuando el menú está oculto, para que
 * el logo y el botón no se muevan de lugar.
 */
export function CabeceraMenu({ alNavegar, accion }: { alNavegar?: () => void; accion?: ReactNode }) {
  return (
    <div className="flex h-16 shrink-0 items-center justify-between gap-2 pl-5 pr-3 lg:h-18">
      {/* El logo lleva al inicio del panel: no hace falta una opción «Panel» en el menú */}
      <Link to="/gestion" onClick={alNavegar} aria-label="Ir al inicio del panel de gestión" className="inline-block">
        <MarcaCarrera />
      </Link>
      {accion}
    </div>
  )
}

/**
 * Barra lateral del panel, con las opciones que permite el rol. Sigue el modo: mismo fondo que la página.
 * La cuenta (Mi perfil, cerrar sesión) está en el menú de perfil de la barra superior.
 * accion: botón a la derecha del logo (ocultar el menú en PC, cerrarlo en celular).
 */
export function BarraGestion({ grupos, alNavegar, accion }: { grupos: OpcionMenu[]; alNavegar?: () => void; accion?: ReactNode }) {
  return (
    <div className="flex h-full flex-col border-r border-borde-tarjeta bg-fondo text-texto">
      <CabeceraMenu alNavegar={alNavegar} accion={accion} />

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
                      {({ isActive }) => (
                        <>
                          {/* El ícono activo va en rojo en todos los modos: de noche es lo que más lo distingue */}
                          {Icono ? (
                            <Icono width={18} height={18} aria-hidden="true" className={`shrink-0 ${isActive ? 'text-primario' : ''}`} />
                          ) : (
                            <span className="w-[18px]" />
                          )}
                          <span className="truncate">{opcion.titulo}</span>
                        </>
                      )}
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
