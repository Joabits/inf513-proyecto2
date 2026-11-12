import { Link, useSearchParams } from 'react-router'
import { usePermiso } from '@/compartido/sesion/usePermiso'
import { Boton } from '@/compartido/ui/Boton'
import { EstadoCarga, MensajeError } from '@/compartido/ui/EstadoCarga'
import { IconoExterno } from '@/compartido/ui/Iconos'
import { Pestanas } from '@/compartido/ui/Pestanas'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { FormPresentacionInnova } from '../componentes/FormPresentacionInnova'
import { FormServicios } from '../componentes/FormServicios'
import { useInnova } from '../useInnova'

const SECCIONES = [
  { id: 'presentacion', titulo: 'Presentación' },
  { id: 'servicios', titulo: 'Servicios' },
]

/** CU-22 Gestionar Empresa Junior INNOVA. */
export function GestionInnova() {
  const { data, isPending, isError, refetch } = useInnova()
  const editable = usePermiso('empresa_junior.editar')
  const veSolicitudes = usePermiso('solicitudes_innova.ver')
  const [parametros, setParametros] = useSearchParams()
  const pedida = parametros.get('seccion')
  const activa = SECCIONES.some((s) => s.id === pedida) ? pedida! : SECCIONES[0].id

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-x-6">
        <TituloPagina titulo="Empresa Junior INNOVA" subtitulo="Presentación y servicios que muestra la página de INNOVA." />
        <div className="mb-6 flex flex-wrap gap-2">
          {veSolicitudes && (
            <Link
              to="/gestion/solicitudes-innova"
              className="inline-flex items-center rounded-tema border border-borde px-4 py-2 text-sm font-semibold text-titulo transition-colors hover:border-titulo"
            >
              Ver solicitudes
            </Link>
          )}
          <Link
            to="/empresa-junior"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-tema border border-borde px-4 py-2 text-sm font-semibold text-titulo transition-colors hover:border-titulo"
          >
            Ver la página <IconoExterno width={16} height={16} />
          </Link>
        </div>
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
          {!editable && (
            <p className="mb-6 rounded-tema border border-borde bg-superficie p-4 text-sm text-texto-suave">
              Su rol puede ver esta información, pero no modificarla.
            </p>
          )}

          <Pestanas
            etiqueta="Secciones de INNOVA"
            opciones={SECCIONES}
            activa={activa}
            alCambiar={(id) => setParametros({ seccion: id }, { replace: true })}
          />

          {/* Los paneles ocultos siguen montados: cambiar de pestaña no pierde lo escrito */}
          <div role="tabpanel" id="panel-presentacion" aria-labelledby="pestana-presentacion" hidden={activa !== 'presentacion'} className="pt-6">
            <fieldset disabled={!editable} className="min-w-0">
              <FormPresentacionInnova contenido={data.contenido} />
            </fieldset>
          </div>
          <div role="tabpanel" id="panel-servicios" aria-labelledby="pestana-servicios" hidden={activa !== 'servicios'} className="pt-6">
            <fieldset disabled={!editable} className="min-w-0">
              <FormServicios servicios={data.servicios} />
            </fieldset>
          </div>
        </>
      )}
    </div>
  )
}
