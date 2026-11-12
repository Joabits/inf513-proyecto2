import { useRef, useState, type ReactNode } from 'react'
import { Link, NavLink } from 'react-router'
import { MarcaCarrera } from '@/compartido/marca/LogoCarrera'
import { iconoDeRuta } from '@/compartido/menu/iconosRuta'
import type { OpcionMenu } from '@/compartido/menu/tipos'

/**
 * Ancho del menú compacto: relleno del menú y de la opción (3rem), ícono (18px) y borde (1px).
 * Con ese ancho cada ícono queda en el mismo lugar que con el menú completo.
 */
export const ANCHO_MENU_COMPACTO = 'w-[calc(3rem+19px)]'

// La opción de la página actual no lleva fondo, ni al pasar el mouse: se marca con el color del texto y del ícono.
// text-acento es rojo de día; de noche y en alto contraste cambia para que el texto se lea bien.
const claseEnlace =
  (compacto: boolean) =>
  ({ isActive }: { isActive: boolean }) =>
    `flex items-center rounded-tema px-3 py-2 text-sm transition-colors ${compacto ? '' : 'gap-3'} ${
      isActive ? 'font-semibold text-acento' : 'text-texto hover:bg-superficie hover:text-titulo'
    }`

/**
 * Fila del logo con un botón a la derecha, de la altura de la barra superior.
 * En PC va en la barra superior (con el botón para contraer el menú); en celular, arriba del menú desplegable.
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

interface Pista {
  texto: string
  x: number
  y: number
}

/**
 * Opciones del panel que permite el rol, por grupos.
 * compacto: solo los íconos, cada uno en el mismo lugar que con el menú completo. El nombre de la opción
 * aparece al lado al pasar el mouse o al llegar con el teclado.
 */
export function MenuGestion({ grupos, compacto = false, alNavegar }: { grupos: OpcionMenu[]; compacto?: boolean; alNavegar?: () => void }) {
  const menu = useRef<HTMLElement>(null)
  const [pista, setPista] = useState<Pista | null>(null)

  // La pista es fixed para que el scroll del menú no la recorte
  function mostrarPista(enlace: HTMLElement, texto: string) {
    const opcion = enlace.getBoundingClientRect()
    const borde = menu.current?.getBoundingClientRect().right ?? opcion.right
    setPista({ texto, x: borde + 8, y: opcion.top + opcion.height / 2 })
  }
  const ocultarPista = () => setPista(null)

  return (
    <>
      <nav
        ref={menu}
        aria-label="Menú de gestión"
        onScroll={ocultarPista}
        className={`flex-1 space-y-6 overflow-y-auto px-3 pb-6 pt-3 ${compacto ? '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden' : ''}`}
      >
        {grupos.map((grupo) => (
          <div key={grupo.id}>
            {/* Una sola línea. Compacto: no se ve pero guarda su espacio, así los íconos no suben */}
            <p className={`mb-1.5 truncate px-3 text-[0.7rem] font-bold uppercase tracking-widest text-texto-suave ${compacto ? 'invisible' : ''}`}>
              {grupo.titulo}
            </p>
            <ul className="space-y-0.5">
              {grupo.hijos.map((opcion) => {
                const Icono = iconoDeRuta(opcion.ruta)
                const verPista = compacto ? (e: { currentTarget: HTMLElement }) => mostrarPista(e.currentTarget, opcion.titulo) : undefined
                return (
                  <li key={opcion.id}>
                    <NavLink
                      to={opcion.ruta ?? '/gestion'}
                      onClick={alNavegar}
                      aria-label={compacto ? opcion.titulo : undefined}
                      onMouseEnter={verPista}
                      onFocus={verPista}
                      onMouseLeave={compacto ? ocultarPista : undefined}
                      onBlur={compacto ? ocultarPista : undefined}
                      className={claseEnlace(compacto)}
                    >
                      {({ isActive }) => (
                        <>
                          {/* El ícono activo va en rojo en todos los modos: de noche es lo que más lo distingue */}
                          {Icono ? (
                            <Icono width={18} height={18} aria-hidden="true" className={`shrink-0 ${isActive ? 'text-primario' : ''}`} />
                          ) : (
                            <span className="w-[18px] shrink-0" />
                          )}
                          {/* Compacto: el nombre queda con ancho 0, así la opción conserva su altura */}
                          <span className={compacto ? 'w-0 overflow-hidden whitespace-nowrap' : 'truncate'}>{opcion.titulo}</span>
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

      {compacto && pista && (
        <span
          aria-hidden="true"
          className="pointer-events-none fixed z-50 -translate-y-1/2 whitespace-nowrap rounded-tema bg-texto px-2.5 py-1.5 text-xs font-semibold text-fondo sombra-elevada"
          style={{ left: pista.x, top: pista.y }}
        >
          {pista.texto}
        </span>
      )}
    </>
  )
}

/**
 * Menú desplegable del celular y la tablet: el logo con un botón para cerrarlo y todas las opciones.
 * La cuenta (Mi perfil, cerrar sesión) está en el menú de perfil de la barra superior.
 */
export function BarraGestion({ grupos, alNavegar, accion }: { grupos: OpcionMenu[]; alNavegar?: () => void; accion?: ReactNode }) {
  return (
    <div className="flex h-full flex-col border-r border-borde-tarjeta bg-fondo text-texto">
      <CabeceraMenu alNavegar={alNavegar} accion={accion} />
      <MenuGestion grupos={grupos} alNavegar={alNavegar} />
    </div>
  )
}
