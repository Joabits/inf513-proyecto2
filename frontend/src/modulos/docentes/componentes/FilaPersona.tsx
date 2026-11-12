import { useState } from 'react'
import { usePermiso } from '@/compartido/sesion/usePermiso'
import { BotonConfirmar } from '@/compartido/ui/BotonConfirmar'
import { IconoBajar, IconoEditar, IconoEliminar, IconoSubir } from '@/compartido/ui/Iconos'
import type { Persona } from '../tipos'
import { useEliminarPersona } from '../useDocentes'
import { FormPersona } from './FormPersona'
import { FotoPersona } from './FotoPersona'

const ACCION =
  'inline-flex items-center gap-2 rounded-tema px-3 py-2 text-sm font-semibold text-titulo transition-colors hover:bg-superficie aria-expanded:bg-superficie'
const MOVER =
  'grid h-9 w-9 place-items-center rounded-tema text-texto-suave transition-colors hover:bg-superficie hover:text-titulo disabled:pointer-events-none disabled:opacity-30'

/** Una persona con sus acciones. Editar se abre dentro de la misma fila. Subir y bajar guardan el orden al instante. */
export function FilaPersona(props: {
  persona: Persona
  esPrimera: boolean
  esUltima: boolean
  ordenando: boolean
  alMover: (direccion: -1 | 1) => void
}) {
  const { persona, esPrimera, esUltima, ordenando, alMover } = props
  const [editando, setEditando] = useState(false)
  const eliminar = useEliminarPersona()
  const puedeEditar = usePermiso('docentes.editar')
  const puedeEliminar = usePermiso('docentes.eliminar')
  const idPanel = `panel-persona-${persona.id}`

  return (
    <li className="rounded-tema border border-borde-tarjeta bg-tarjeta p-4 sombra-suave md:p-5">
      <div className="flex items-center gap-4">
        <FotoPersona nombre={persona.nombre} foto={persona.foto} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h4 className="font-cuerpo text-base font-bold text-titulo">{persona.nombre}</h4>
            {persona.destacado && <span className="rounded-full bg-chip px-2 py-0.5 text-xs font-semibold text-sobre-chip">Destacado</span>}
            {!persona.visible && (
              <span className="rounded-full border border-borde px-2 py-0.5 text-xs font-semibold text-texto-suave">Oculto</span>
            )}
          </div>
          <p className="text-sm text-texto-suave">{persona.cargo}</p>
        </div>

        {puedeEditar && (
          <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
            <button type="button" className={MOVER} disabled={esPrimera || ordenando} onClick={() => alMover(-1)} aria-label={`Subir a ${persona.nombre}`}>
              <IconoSubir width={18} height={18} />
            </button>
            <button type="button" className={MOVER} disabled={esUltima || ordenando} onClick={() => alMover(1)} aria-label={`Bajar a ${persona.nombre}`}>
              <IconoBajar width={18} height={18} />
            </button>
          </div>
        )}
      </div>

      {(puedeEditar || puedeEliminar) && (
        <div className="-ml-3 mt-2 flex flex-wrap items-center gap-1 md:ml-13">
          {puedeEditar && (
            <button type="button" className={ACCION} aria-expanded={editando} aria-controls={idPanel} onClick={() => setEditando(!editando)}>
              <IconoEditar width={16} height={16} /> Editar
            </button>
          )}
          {puedeEliminar && (
            <span className="ml-auto">
              <BotonConfirmar
                pregunta={`¿Quitar a ${persona.nombre}?`}
                confirmar="Sí, quitar"
                ocupado={eliminar.isPending}
                alConfirmar={() => eliminar.mutate(persona.id)}
              >
                <IconoEliminar width={16} height={16} /> Quitar
              </BotonConfirmar>
            </span>
          )}
        </div>
      )}
      {eliminar.isError && (
        <p role="alert" className="mt-2 text-sm font-semibold text-acento">
          No se pudo quitar. Intente de nuevo.
        </p>
      )}

      {editando && (
        <div id={idPanel} className="mt-5 border-t border-borde pt-5">
          <FormPersona persona={persona} alTerminar={() => setEditando(false)} />
        </div>
      )}
    </li>
  )
}
