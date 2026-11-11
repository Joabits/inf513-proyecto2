import { Link, NavLink } from 'react-router'
import { LogoFcee } from '@/compartido/marca/LogoFcee'
import type { OpcionMenu } from '@/compartido/menu/tipos'
import type { UsuarioSesion } from '@/compartido/sesion/tipos'
import { useCerrarSesion } from '@/compartido/sesion/useCerrarSesion'
import { IconoExterno, IconoPanel, IconoSalir } from '@/compartido/ui/Iconos'

const claseEnlace = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 rounded-tema px-3 py-2 text-sm transition-colors ${isActive ? 'bg-primario font-semibold' : 'hover:bg-marino'}`

const ACCION = 'flex w-full items-center gap-2 rounded-tema px-3 py-2 text-sm transition-colors hover:bg-marino disabled:opacity-60'

/** Barra lateral del panel: siempre a la vista, con las opciones que permite el rol. */
export function BarraGestion({ usuario, grupos, alNavegar }: { usuario: UsuarioSesion; grupos: OpcionMenu[]; alNavegar?: () => void }) {
  const cerrarSesion = useCerrarSesion()

  return (
    <div className="flex h-full flex-col bg-marino-oscuro text-sobre-primario">
      <div className="p-5">
        <Link to="/gestion" onClick={alNavegar} aria-label="Ir al panel de gestión" className="inline-block">
          <LogoFcee version="negativo" className="h-12" />
        </Link>
      </div>

      <nav aria-label="Menú de gestión" className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        <NavLink to="/gestion" end onClick={alNavegar} className={claseEnlace}>
          <IconoPanel width={18} height={18} /> Panel
        </NavLink>

        {grupos.map((grupo) => (
          <div key={grupo.id}>
            <p className="mb-1 px-3 text-xs font-bold uppercase tracking-wider">{grupo.titulo}</p>
            <ul className="space-y-0.5">
              {grupo.hijos.map((opcion) => (
                <li key={opcion.id}>
                  <NavLink to={opcion.ruta ?? '/gestion'} onClick={alNavegar} className={claseEnlace}>
                    {opcion.titulo}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="space-y-1 border-t border-marino p-3">
        <p className="px-3 py-1 text-sm">
          <span className="block truncate font-semibold">{usuario.nombre}</span>
          <span className="block truncate text-xs">{usuario.rol?.nombre}</span>
        </p>
        <Link to="/" target="_blank" className={ACCION}>
          <IconoExterno width={16} height={16} /> Ver el portal
        </Link>
        <button type="button" className={ACCION} disabled={cerrarSesion.isPending} onClick={() => cerrarSesion.mutate()}>
          <IconoSalir width={16} height={16} /> Cerrar sesión
        </button>
      </div>
    </div>
  )
}
