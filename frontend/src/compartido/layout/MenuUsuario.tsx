import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router'
import type { UsuarioSesion } from '@/compartido/sesion/tipos'
import { useCerrarSesion } from '@/compartido/sesion/useCerrarSesion'
import { Boton } from '@/compartido/ui/Boton'
import { IconoAbajo, IconoPanel, IconoSalir, IconoUsuario } from '@/compartido/ui/Iconos'
import { useClicFuera } from '@/compartido/ui/useClicFuera'

/** Botón del usuario con sesión iniciada que visita el portal: lleva a su panel o cierra la sesión. */
export function MenuUsuario({ usuario }: { usuario: UsuarioSesion }) {
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
        aria-label={`Menú de ${usuario.nombre}`}
        onClick={() => setAbierto(!abierto)}
        title="Mi cuenta"
        className="flex h-10 items-center gap-1 rounded-full border border-borde pl-1 pr-2 text-titulo transition-colors hover:border-titulo"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-superficie">
          <IconoUsuario width={16} height={16} />
        </span>
        <IconoAbajo width={14} height={14} className={`transition-transform ${abierto ? 'rotate-180' : ''}`} />
      </button>

      {abierto && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 space-y-3 rounded-tema border border-borde bg-fondo p-4 text-texto shadow-xl">
          <p>
            <span className="block font-semibold text-titulo">{usuario.nombre}</span>
            <span className="text-sm text-texto-suave">{usuario.rol?.nombre}</span>
          </p>
          <Link
            to="/gestion"
            onClick={cerrar}
            className="flex items-center justify-center gap-2 rounded-tema bg-primario px-4 py-2 text-sm font-semibold text-sobre-primario transition-colors hover:bg-marino"
          >
            <IconoPanel width={16} height={16} /> Ir al panel
          </Link>
          <Boton variante="borde" disabled={cerrarSesion.isPending} onClick={() => cerrarSesion.mutate()} className="flex w-full items-center justify-center gap-2 text-sm">
            <IconoSalir width={16} height={16} /> Cerrar sesión
          </Boton>
        </div>
      )}
    </div>
  )
}
