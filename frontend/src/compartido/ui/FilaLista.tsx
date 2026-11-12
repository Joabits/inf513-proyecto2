import type { ReactNode } from 'react'
import { IconoBajar, IconoEliminar, IconoSubir } from '@/compartido/ui/Iconos'

const ACCION = 'grid h-9 w-9 place-items-center rounded-tema text-texto-suave transition-colors hover:bg-superficie hover:text-titulo disabled:pointer-events-none disabled:opacity-30'

/**
 * Elemento de una lista editable con sus acciones de orden y eliminación.
 * Quitar no pide confirmación: nada se borra hasta pulsar "Guardar cambios".
 * Con `noQuitar` el botón se desactiva (por ejemplo, si otros datos dependen del elemento):
 * el motivo debe mostrarse dentro de la fila.
 */
export function FilaLista(props: {
  numero: number
  total: number
  nombre: string
  alSubir: () => void
  alBajar: () => void
  alQuitar: () => void
  noQuitar?: boolean
  children: ReactNode
}) {
  const { numero, total, nombre, alSubir, alBajar, alQuitar, noQuitar = false, children } = props

  return (
    <li className="flex gap-3 rounded-tema border border-borde bg-fondo p-4">
      <span className="mt-7 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-superficie text-sm font-bold text-titulo" aria-hidden="true">
        {numero}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
      <div className="mt-6 flex shrink-0 flex-col gap-1 sm:flex-row">
        <button type="button" className={ACCION} onClick={alSubir} disabled={numero === 1} aria-label={`Subir ${nombre}`}>
          <IconoSubir width={18} height={18} />
        </button>
        <button type="button" className={ACCION} onClick={alBajar} disabled={numero === total} aria-label={`Bajar ${nombre}`}>
          <IconoBajar width={18} height={18} />
        </button>
        <button
          type="button"
          className={`${ACCION} hover:text-acento`}
          onClick={alQuitar}
          disabled={noQuitar}
          aria-label={noQuitar ? `No se puede quitar ${nombre}` : `Quitar ${nombre}`}
        >
          <IconoEliminar width={18} height={18} />
        </button>
      </div>
    </li>
  )
}
