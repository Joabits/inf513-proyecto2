import { Link, useSearchParams } from 'react-router'
import { usePermiso } from '@/compartido/sesion/usePermiso'
import { Boton } from '@/compartido/ui/Boton'
import { EstadoCarga, MensajeError } from '@/compartido/ui/EstadoCarga'
import { IconoExterno } from '@/compartido/ui/Iconos'
import { Pestanas } from '@/compartido/ui/Pestanas'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { FormContenidoInstitucional } from '../componentes/FormContenidoInstitucional'
import { FormHitos } from '../componentes/FormHitos'
import { useInstitucional } from '../useInstitucional'

const SECCIONES = [
  { id: 'contenido', titulo: 'Contenido' },
  { id: 'hitos', titulo: 'Hitos' },
]

export function GestionInstitucional() {
  const { data, isPending, isError, refetch } = useInstitucional()
  const editable = usePermiso('institucional.editar')
  const [parametros, setParametros] = useSearchParams()
  const pedida = parametros.get('seccion')
  const activa = SECCIONES.some((s) => s.id === pedida) ? pedida! : SECCIONES[0].id

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-x-6">
        <TituloPagina titulo="Información institucional" subtitulo="Textos de la página «La Carrera»: presentación, misión, visión, historia y perfil profesional." />
        <Link
          to="/carrera"
          target="_blank"
          className="mb-6 inline-flex items-center gap-2 rounded-tema border border-borde px-4 py-2 text-sm font-semibold text-titulo transition-colors hover:border-titulo"
        >
          Ver la página <IconoExterno width={16} height={16} />
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
          {!editable && (
            <p className="mb-6 rounded-tema border border-borde bg-superficie p-4 text-sm text-texto-suave">
              Su rol puede ver esta información, pero no modificarla.
            </p>
          )}

          <Pestanas
            etiqueta="Secciones de la información institucional"
            opciones={SECCIONES}
            activa={activa}
            alCambiar={(id) => setParametros({ seccion: id }, { replace: true })}
          />

          {/* Los paneles ocultos siguen montados: cambiar de pestaña no pierde lo escrito */}
          <div role="tabpanel" id="panel-contenido" aria-labelledby="pestana-contenido" hidden={activa !== 'contenido'} className="pt-6">
            <fieldset disabled={!editable} className="min-w-0">
              <FormContenidoInstitucional contenido={data.contenido} />
            </fieldset>
          </div>
          <div role="tabpanel" id="panel-hitos" aria-labelledby="pestana-hitos" hidden={activa !== 'hitos'} className="pt-6">
            <fieldset disabled={!editable} className="min-w-0">
              <FormHitos hitos={data.hitos} />
            </fieldset>
          </div>
        </>
      )}
    </div>
  )
}
