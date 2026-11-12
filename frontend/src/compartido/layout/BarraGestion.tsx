import { Link, NavLink } from 'react-router'
import { MarcaCarrera } from '@/compartido/marca/LogoCarrera'
import { iconoDeRuta } from '@/compartido/menu/iconosRuta'
import type { OpcionMenu } from '@/compartido/menu/tipos'
import type { UsuarioSesion } from '@/compartido/sesion/tipos'
import { useCerrarSesion } from '@/compartido/sesion/useCerrarSesion'
import { IconoExterno, IconoSalir } from '@/compartido/ui/Iconos'

const claseEnlace = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-tema px-3 py-2 text-sm transition-colors ${
    isActive ? 'bg-primario font-semibold text-sobre-primario' : 'text-texto hover:bg-superficie hover:text-titulo'
  }`

const ACCION =
  'flex w-full items-center gap-3 rounded-tema px-3 py-2 text-sm text-texto transition-colors hover:bg-superficie hover:text-titulo disabled:opacity-60'

/** «Director de Carrera» → «DC» */
const iniciales = (nombre: string) =>
  nombre
    .replace(/\(.*?\)/g, '')
    .split(/\s+/)
    .filter((palabra) => palabra.length > 2)
    .slice(0, 2)
    .map((palabra) => palabra[0].toUpperCase())
    .join('')

/** Barra lateral del panel, con las opciones que permite el rol. Sigue el modo: mismo fondo que la página. */
export function BarraGestion({ usuario, grupos, alNavegar }: { usuario: UsuarioSesion; grupos: OpcionMenu[]; alNavegar?: () => void }) {
  const cerrarSesion = useCerrarSesion()

  return (
    <div className="flex h-full flex-col border-r border-borde-tarjeta bg-fondo text-texto">
      <div className="px-5 pb-4 pt-5">
        {/* El logo lleva al inicio del panel: no hace falta una opción «Panel» en el menú */}
        <Link to="/gestion" onClick={alNavegar} aria-label="Ir al inicio del panel de gestión" className="inline-block">
          <MarcaCarrera />
        </Link>
      </div>

      <nav aria-label="Menú de gestión" className="flex-1 space-y-6 overflow-y-auto px-3 pb-4">
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

      <div className="space-y-1 border-t border-borde p-3">
        <div className="flex items-center gap-3 px-3 py-2">
          <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primario text-xs font-bold text-sobre-primario">
            {iniciales(usuario.nombre)}
          </span>
          <p className="min-w-0 text-sm">
            <span className="block truncate font-semibold text-titulo">{usuario.nombre}</span>
            <span className="block truncate text-xs text-texto-suave">{usuario.rol?.nombre}</span>
          </p>
        </div>
        <Link to="/" target="_blank" className={ACCION}>
          <IconoExterno width={16} height={16} aria-hidden="true" /> Ver el portal
        </Link>
        <button type="button" className={ACCION} disabled={cerrarSesion.isPending} onClick={() => cerrarSesion.mutate()}>
          <IconoSalir width={16} height={16} aria-hidden="true" /> Cerrar sesión
        </button>
      </div>
    </div>
  )
}
