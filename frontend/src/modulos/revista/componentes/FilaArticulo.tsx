import { useState } from 'react'
import { usePermiso } from '@/compartido/sesion/usePermiso'
import { BotonConfirmar } from '@/compartido/ui/BotonConfirmar'
import { IconoBajar, IconoDocumento, IconoEditar, IconoEliminar, IconoExterno, IconoSubir } from '@/compartido/ui/Iconos'
import { urlArticuloPanel } from '../api'
import { formatoTamano } from '../formato'
import type { Articulo } from '../tipos'
import { useEliminarArticulo } from '../useRevista'
import { FormArticulo } from './FormArticulo'

const ACCION =
  'inline-flex items-center gap-2 rounded-tema px-3 py-2 text-sm font-semibold text-titulo transition-colors hover:bg-superficie aria-expanded:bg-superficie'
const MOVER =
  'grid h-9 w-9 place-items-center rounded-tema text-texto-suave transition-colors hover:bg-superficie hover:text-titulo disabled:pointer-events-none disabled:opacity-30'

/** Un artículo con sus acciones. Editar se abre dentro de la misma fila; subir y bajar guardan el orden al instante. */
export function FilaArticulo(props: {
  articulo: Articulo
  edicion: number
  esPrimero: boolean
  esUltimo: boolean
  ordenando: boolean
  alMover: (direccion: -1 | 1) => void
}) {
  const { articulo, edicion, esPrimero, esUltimo, ordenando, alMover } = props
  const [editando, setEditando] = useState(false)
  const eliminar = useEliminarArticulo()
  const puedeEditar = usePermiso('revista.editar')
  const puedeEliminar = usePermiso('revista.eliminar')

  return (
    <li className="py-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h5 className="font-cuerpo text-base font-bold leading-snug text-titulo">{articulo.titulo}</h5>
          <p className="mt-0.5 text-sm text-texto-suave">{articulo.autores}</p>
          {articulo.archivo && (
            <a
              href={urlArticuloPanel(articulo.id)}
              target="_blank"
              rel="noopener"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-acento underline-offset-4 hover:underline"
            >
              <IconoDocumento width={14} height={14} aria-hidden="true" /> PDF ({formatoTamano(articulo.archivo.tamano)}) <IconoExterno width={12} height={12} aria-hidden="true" />
              <span className="sr-only">(se abre en otra pestaña)</span>
            </a>
          )}
        </div>

        {puedeEditar && (
          <div className="flex shrink-0 gap-1">
            <button type="button" className={MOVER} disabled={esPrimero || ordenando} onClick={() => alMover(-1)} aria-label={`Subir «${articulo.titulo}»`}>
              <IconoSubir width={18} height={18} />
            </button>
            <button type="button" className={MOVER} disabled={esUltimo || ordenando} onClick={() => alMover(1)} aria-label={`Bajar «${articulo.titulo}»`}>
              <IconoBajar width={18} height={18} />
            </button>
          </div>
        )}
      </div>

      {(puedeEditar || puedeEliminar) && (
        <div className="-ml-3 mt-1 flex flex-wrap items-center gap-1">
          {puedeEditar && (
            <button type="button" className={ACCION} aria-expanded={editando} onClick={() => setEditando(!editando)}>
              <IconoEditar width={16} height={16} /> Editar
            </button>
          )}
          {puedeEliminar && (
            <span className="ml-auto">
              <BotonConfirmar
                pregunta="¿Quitar el artículo?"
                confirmar="Sí, quitar"
                ocupado={eliminar.isPending}
                alConfirmar={() => eliminar.mutate(articulo.id)}
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
        <div className="mt-4 border-t border-borde pt-5">
          <FormArticulo edicion={edicion} articulo={articulo} alTerminar={() => setEditando(false)} />
        </div>
      )}
    </li>
  )
}
