import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router'
import { iniciales } from '@/compartido/sesion/iniciales'
import type { UsuarioSesion } from '@/compartido/sesion/tipos'
import { useCerrarSesion } from '@/compartido/sesion/useCerrarSesion'
import { IconoAbajo, IconoSalir, IconoUsuario } from '@/compartido/ui/Iconos'
import { useClicFuera } from '@/compartido/ui/useClicFuera'

const OPCION =
  'flex w-full items-center gap-3 rounded-tema px-3 py-2.5 text-sm text-texto transition-colors hover:bg-superficie hover:text-titulo disabled:opacity-60'

function Avatar({ nombre, grande = false }: { nombre: string; grande?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full bg-primario font-bold text-sobre-primario ${grande ? 'h-11 w-11 text-sm' : 'h-9 w-9 text-xs'}`}
    >
      {iniciales(nombre)}
    </span>
  )
}

/** Menú de perfil en la barra superior del panel: datos de la cuenta, «Mi perfil» y cerrar sesión. */
export function MenuPerfil({ usuario }: { usuario: UsuarioSesion }) {
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
        aria-label={`Mi cuenta: ${usuario.nombre}`}
        title="Mi cuenta"
        onClick={() => setAbierto(!abierto)}
        className="flex items-center gap-1.5 rounded-full p-0.5 pr-2 text-titulo transition-colors hover:bg-superficie"
      >
        <Avatar nombre={usuario.nombre} />
        <IconoAbajo width={14} height={14} aria-hidden="true" className={`transition-transform ${abierto ? 'rotate-180' : ''}`} />
      </button>

      {abierto && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-tema border border-borde-tarjeta bg-tarjeta p-2 sombra-elevada">
          <div className="flex items-center gap-3 px-3 py-3">
            <Avatar nombre={usuario.nombre} grande />
            <p className="min-w-0 text-sm">
              <span className="block truncate font-semibold text-titulo">{usuario.nombre}</span>
              <span className="block truncate text-xs text-texto-suave">{usuario.rol?.nombre}</span>
              <span className="block truncate text-xs text-texto-suave">{usuario.email}</span>
            </p>
          </div>
          <Link to="/gestion/perfil" onClick={cerrar} className={OPCION}>
            <IconoUsuario width={18} height={18} aria-hidden="true" /> Mi perfil
          </Link>
          <button type="button" className={OPCION} disabled={cerrarSesion.isPending} onClick={() => cerrarSesion.mutate()}>
            <IconoSalir width={18} height={18} aria-hidden="true" /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}
