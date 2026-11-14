import { useState } from 'react'
import { usePermiso } from '@/compartido/sesion/usePermiso'
import { BotonConfirmar } from '@/compartido/ui/BotonConfirmar'
import { IconoDocumento, IconoEditar, IconoEliminar, IconoExterno, IconoRevista } from '@/compartido/ui/Iconos'
import { urlEdicionPanel } from '../api'
import { formatoTamano } from '../formato'
import type { Edicion } from '../tipos'
import { useEliminarEdicion } from '../useRevista'
import { EstadoEdicion } from './EstadoEdicion'
import { FormEdicion } from './FormEdicion'
import { ListaArticulos } from './ListaArticulos'

const ACCION =
  'inline-flex items-center gap-2 rounded-tema px-3 py-2 text-sm font-semibold text-titulo transition-colors hover:bg-superficie aria-expanded:bg-superficie'

type Panel = 'editar' | 'articulos' | null

/** Una edición con sus acciones. Editar y los artículos se abren dentro de la misma tarjeta. */
export function FilaEdicion({ edicion }: { edicion: Edicion }) {
  const [panel, setPanel] = useState<Panel>(null)
  const eliminar = useEliminarEdicion()
  const puedeEditar = usePermiso('revista.editar')
  const puedeEliminar = usePermiso('revista.eliminar')
  const idPanel = `panel-edicion-${edicion.id}`
  const alternar = (nuevo: Panel) => setPanel((actual) => (actual === nuevo ? null : nuevo))

  return (
    <li className="rounded-tema border border-borde-tarjeta bg-tarjeta p-5 sombra-suave">
      <div className="flex gap-4">
        {edicion.portada ? (
          <img src={edicion.portada} alt="" loading="lazy" className="h-24 w-[4.5rem] shrink-0 rounded-tema object-cover" />
        ) : (
          <span className="grid h-24 w-[4.5rem] shrink-0 place-items-center rounded-tema bg-chip text-sobre-chip" aria-hidden="true">
            <IconoRevista width={28} height={28} />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3 className="font-cuerpo text-base font-bold text-titulo">{edicion.nombre}</h3>
            <EstadoEdicion edicion={edicion} editable={puedeEditar} />
          </div>
          {edicion.titulo && <p className="mt-1 text-texto">{edicion.titulo}</p>}
          <p className="mt-1 text-sm text-texto-suave">
            {edicion.articulos.length} {edicion.articulos.length === 1 ? 'artículo' : 'artículos'}
            {edicion.archivo ? ` · PDF de ${formatoTamano(edicion.archivo.tamano)}` : ' · Sin PDF de la edición'}
          </p>

          <div className="-ml-3 mt-2 flex flex-wrap items-center gap-1">
            <button type="button" className={ACCION} aria-expanded={panel === 'articulos'} aria-controls={idPanel} onClick={() => alternar('articulos')}>
              <IconoDocumento width={16} height={16} /> Artículos ({edicion.articulos.length})
            </button>
            {puedeEditar && (
              <button type="button" className={ACCION} aria-expanded={panel === 'editar'} aria-controls={idPanel} onClick={() => alternar('editar')}>
                <IconoEditar width={16} height={16} /> Editar
              </button>
            )}
            {edicion.archivo && (
              <a href={urlEdicionPanel(edicion.id)} target="_blank" rel="noopener" className={ACCION}>
                <IconoExterno width={16} height={16} /> Abrir PDF
                <span className="sr-only">(se abre en otra pestaña)</span>
              </a>
            )}
            {puedeEliminar && (
              <span className="ml-auto">
                <BotonConfirmar
                  pregunta="¿Eliminar la edición, sus artículos y sus archivos?"
                  confirmar="Sí, eliminar"
                  ocupado={eliminar.isPending}
                  alConfirmar={() => eliminar.mutate(edicion.id)}
                >
                  <IconoEliminar width={16} height={16} /> Eliminar
                </BotonConfirmar>
              </span>
            )}
          </div>
          {eliminar.isError && (
            <p role="alert" className="mt-2 text-sm font-semibold text-acento">
              No se pudo eliminar. Intente de nuevo.
            </p>
          )}
        </div>
      </div>

      {panel && (
        <div id={idPanel} className="mt-5 border-t border-borde pt-5">
          {panel === 'editar' ? <FormEdicion edicion={edicion} alTerminar={() => setPanel(null)} /> : <ListaArticulos edicion={edicion} />}
        </div>
      )}
    </li>
  )
}
