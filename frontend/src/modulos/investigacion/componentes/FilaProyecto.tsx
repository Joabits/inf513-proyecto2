import { useState } from 'react'
import { mensajeDeError } from '@/compartido/api/errores'
import { usePermiso } from '@/compartido/sesion/usePermiso'
import { BotonConfirmar } from '@/compartido/ui/BotonConfirmar'
import { IconoEditar, IconoEliminar, IconoOcultar, IconoVer } from '@/compartido/ui/Iconos'
import { ESTADOS, TIPOS, type Linea, type Proyecto } from '../tipos'
import { useCambiarPublicacion, useEliminarProyecto } from '../useInvestigacion'
import { FormProyecto } from './FormProyecto'

const ACCION =
  'inline-flex items-center gap-2 rounded-tema px-3 py-2 text-sm font-semibold text-titulo transition-colors hover:bg-superficie aria-expanded:bg-superficie disabled:opacity-60'

const ETIQUETA = 'inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold'

/** Un proyecto con sus acciones. Editar se abre dentro de la misma fila. */
export function FilaProyecto({ proyecto, lineas }: { proyecto: Proyecto; lineas: Linea[] }) {
  const [editando, setEditando] = useState(false)
  const publicacion = useCambiarPublicacion()
  const eliminar = useEliminarProyecto()
  const puedeEditar = usePermiso('investigacion.editar')
  const puedeEliminar = usePermiso('investigacion.eliminar')
  const idPanel = `panel-proyecto-${proyecto.id}`
  const error = publicacion.error ?? eliminar.error

  return (
    <li className="py-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`${ETIQUETA} border-borde text-texto-suave`}>{TIPOS[proyecto.tipo]}</span>
        <span className={`${ETIQUETA} ${proyecto.estado === 'en_curso' ? 'border-titulo text-titulo' : 'border-borde text-texto-suave'}`}>
          {ESTADOS[proyecto.estado]}
        </span>
        {!proyecto.publicado && <span className={`${ETIQUETA} border-primario text-acento`}>Oculto</span>}
      </div>
      <h3 className="mt-2 font-cuerpo text-base font-bold text-titulo">{proyecto.titulo}</h3>
      <p className="mt-1 text-sm text-texto">
        {proyecto.responsable} · Gestión {proyecto.gestion}
      </p>
      <p className="mt-1 text-sm text-texto-suave">{proyecto.linea?.nombre ?? 'Sin línea de investigación asignada'}</p>

      {(puedeEditar || puedeEliminar) && (
        <div className="-ml-3 mt-2 flex flex-wrap items-center gap-1">
          {puedeEditar && (
            <>
              <button type="button" className={ACCION} aria-expanded={editando} aria-controls={idPanel} onClick={() => setEditando((e) => !e)}>
                <IconoEditar width={16} height={16} /> Editar
              </button>
              <button
                type="button"
                className={ACCION}
                disabled={publicacion.isPending}
                onClick={() => publicacion.mutate({ id: proyecto.id, publicado: !proyecto.publicado })}
              >
                {proyecto.publicado ? <IconoOcultar width={16} height={16} /> : <IconoVer width={16} height={16} />}
                {proyecto.publicado ? 'Ocultar' : 'Publicar'}
              </button>
            </>
          )}
          {puedeEliminar && (
            <span className="ml-auto">
              <BotonConfirmar pregunta="¿Eliminar el proyecto?" confirmar="Sí, eliminar" ocupado={eliminar.isPending} alConfirmar={() => eliminar.mutate(proyecto.id)}>
                <IconoEliminar width={16} height={16} /> Eliminar
              </BotonConfirmar>
            </span>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="mt-2 text-sm font-semibold text-acento">
          {mensajeDeError(error)}
        </p>
      )}

      {editando && (
        <div id={idPanel} className="mt-4 rounded-tema border border-borde p-5">
          <FormProyecto proyecto={proyecto} lineas={lineas} alTerminar={() => setEditando(false)} />
        </div>
      )}
    </li>
  )
}
