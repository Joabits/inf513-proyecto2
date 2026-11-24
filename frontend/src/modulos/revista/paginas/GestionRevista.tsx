import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { usePermiso } from '@/compartido/sesion/usePermiso'
import { Boton } from '@/compartido/ui/Boton'
import { EstadoCarga, MensajeError } from '@/compartido/ui/EstadoCarga'
import { IconoAgregar, IconoExterno } from '@/compartido/ui/Iconos'
import { Pestanas } from '@/compartido/ui/Pestanas'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { FilaEdicion } from '../componentes/FilaEdicion'
import { FormContenidoRevista } from '../componentes/FormContenidoRevista'
import { FormEdicion } from '../componentes/FormEdicion'
import { useRevistaGestion } from '../useRevista'

const SECCIONES = [
  { id: 'ediciones', titulo: 'Ediciones' },
  { id: 'contenido', titulo: 'Presentación y colaboradores' },
]

/** CU-21 Gestionar INNOVAR: las ediciones con sus artículos, y los textos de la revista. */
export function GestionRevista() {
  const { data, isPending, isError, refetch } = useRevistaGestion()
  const editable = usePermiso('revista.editar')
  const puedeCrear = usePermiso('revista.crear')
  const [creando, setCreando] = useState(false)
  const [parametros, setParametros] = useSearchParams()
  const pedida = parametros.get('seccion')
  const activa = SECCIONES.some((s) => s.id === pedida) ? pedida! : SECCIONES[0].id

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-x-6">
        <TituloPagina titulo="Revista INNOVAR" subtitulo="Las ediciones, sus artículos y los textos de la revista académica." />
        <Link
          to="/revista-innovar"
          target="_blank"
          className="mb-6 inline-flex items-center gap-2 rounded-tema border border-borde px-4 py-2 text-sm font-semibold text-titulo transition-colors hover:border-titulo"
        >
          Ver la revista <IconoExterno width={16} height={16} />
        </Link>
      </div>

      {isPending && <EstadoCarga />}

      {isError && (
        <div className="space-y-4 text-center">
          <MensajeError />
          <Boton variante="borde" onClick={() => refetch()}>
            Reintentar
          </Boton>
        </div>
      )}

      {data && (
        <>
          <Pestanas
            etiqueta="Secciones de la revista"
            opciones={SECCIONES}
            activa={activa}
            alCambiar={(id) => setParametros({ seccion: id }, { replace: true })}
          />

          {/* Los paneles ocultos siguen montados: cambiar de pestaña no pierde lo escrito */}
          <div role="tabpanel" id="panel-ediciones" aria-labelledby="pestana-ediciones" hidden={activa !== 'ediciones'} className="pt-6">
            {puedeCrear && !creando && (
              <div className="mb-6 flex justify-end">
                <Boton type="button" onClick={() => setCreando(true)} className="inline-flex items-center gap-2">
                  <IconoAgregar width={18} height={18} /> Nueva edición
                </Boton>
              </div>
            )}

            {creando && (
              <section aria-labelledby="titulo-nueva-edicion" className="mb-8 rounded-tema border border-borde-tarjeta bg-tarjeta p-5 sombra-suave md:p-6">
                <h2 id="titulo-nueva-edicion" className="text-xl text-titulo">
                  Nueva edición
                </h2>
                <p className="mb-6 mt-1 text-sm text-texto-suave">Quedará como borrador hasta que la publique. Los artículos se agregan después de crearla.</p>
                <FormEdicion alTerminar={() => setCreando(false)} />
              </section>
            )}

            {data.ediciones.length > 0 ? (
              <ul className="space-y-4">
                {data.ediciones.map((edicion) => (
                  <FilaEdicion key={edicion.id} edicion={edicion} />
                ))}
              </ul>
            ) : (
              !creando && (
                <div className="rounded-tema border border-dashed border-borde px-6 py-12 text-center">
                  <p className="font-semibold text-titulo">Todavía no hay ediciones.</p>
                  <p className="mt-1 text-texto-suave">Cree la primera con «Nueva edición». Mientras tanto, el portal avisa que se publicarán pronto.</p>
                </div>
              )
            )}
          </div>

          <div role="tabpanel" id="panel-contenido" aria-labelledby="pestana-contenido" hidden={activa !== 'contenido'} className="pt-6">
            {!editable && (
              <p className="mb-6 rounded-tema border border-borde-tarjeta bg-tarjeta p-4 text-sm text-texto-suave sombra-suave">
                Su rol puede ver esta información, pero no modificarla.
              </p>
            )}
            <fieldset disabled={!editable} className="min-w-0">
              <FormContenidoRevista contenido={data.revista} />
            </fieldset>
          </div>
        </>
      )}
    </div>
  )
}
