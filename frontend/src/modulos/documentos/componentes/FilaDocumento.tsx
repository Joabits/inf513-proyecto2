import { useState } from 'react'
import { usePermiso } from '@/compartido/sesion/usePermiso'
import { BotonConfirmar } from '@/compartido/ui/BotonConfirmar'
import { IconoEditar, IconoEliminar, IconoExterno, IconoHistorial } from '@/compartido/ui/Iconos'
import { urlDocumento } from '../api'
import { formatoFecha, formatoTamano } from '../formato'
import type { Documento } from '../tipos'
import { useEliminarDocumento } from '../useDocumentos'
import { EstadoPublicacion } from './EstadoPublicacion'
import { EtiquetaTipo } from './EtiquetaTipo'
import { FormDocumento } from './FormDocumento'
import { HistorialVersiones } from './HistorialVersiones'

const ACCION =
  'inline-flex items-center gap-2 rounded-tema px-3 py-2 text-sm font-semibold text-titulo transition-colors hover:bg-superficie aria-expanded:bg-superficie'

type Panel = 'editar' | 'historial' | null

/** Un documento con sus acciones. Editar y el historial se abren dentro de la misma fila, sin perder el contexto. */
export function FilaDocumento({ documento }: { documento: Documento }) {
  const [panel, setPanel] = useState<Panel>(null)
  const eliminar = useEliminarDocumento()
  const puedeEditar = usePermiso('documentos.editar')
  const puedeEliminar = usePermiso('documentos.eliminar')
  const idPanel = `panel-documento-${documento.id}`

  const alternar = (nuevo: Panel) => setPanel((actual) => (actual === nuevo ? null : nuevo))

  return (
    <li className="py-5">
      <div className="flex gap-4">
        <EtiquetaTipo tipo={documento.tipo} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3 className="font-cuerpo text-base font-bold text-titulo">{documento.titulo}</h3>
            <EstadoPublicacion documento={documento} editable={puedeEditar} />
          </div>
          {documento.descripcion && <p className="mt-1 text-sm text-texto">{documento.descripcion}</p>}
          <p className="mt-1 text-sm text-texto-suave">
            {documento.categoria.nombre} · {formatoTamano(documento.tamano)} · Actualizado el {formatoFecha(documento.actualizado)}
            {documento.subido_por && ` · Subido por ${documento.subido_por}`}
          </p>

          <div className="-ml-3 mt-2 flex flex-wrap items-center gap-1">
            <a href={urlDocumento(documento.id)} target="_blank" rel="noopener" className={ACCION}>
              <IconoExterno width={16} height={16} /> Abrir
            </a>
            {puedeEditar && (
              <button type="button" className={ACCION} aria-expanded={panel === 'editar'} aria-controls={idPanel} onClick={() => alternar('editar')}>
                <IconoEditar width={16} height={16} /> Editar
              </button>
            )}
            {documento.versiones > 0 && (
              <button type="button" className={ACCION} aria-expanded={panel === 'historial'} aria-controls={idPanel} onClick={() => alternar('historial')}>
                <IconoHistorial width={16} height={16} /> Historial ({documento.versiones})
              </button>
            )}
            {puedeEliminar && (
              <span className="ml-auto">
                <BotonConfirmar
                  pregunta="¿Eliminar el documento y su historial?"
                  confirmar="Sí, eliminar"
                  ocupado={eliminar.isPending}
                  alConfirmar={() => eliminar.mutate(documento.id)}
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

          {panel && (
            <div id={idPanel} className="mt-4 rounded-tema border border-borde p-5">
              {panel === 'editar' ? (
                <FormDocumento documento={documento} alTerminar={() => setPanel(null)} />
              ) : (
                <HistorialVersiones id={documento.id} />
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  )
}
