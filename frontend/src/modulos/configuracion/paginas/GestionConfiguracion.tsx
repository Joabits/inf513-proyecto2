import { Link, useSearchParams } from 'react-router'
import { useConfiguracion } from '@/compartido/configuracion/useConfiguracion'
import { usePermiso } from '@/compartido/sesion/usePermiso'
import { Boton } from '@/compartido/ui/Boton'
import { EstadoCarga, MensajeError } from '@/compartido/ui/EstadoCarga'
import { IconoExterno } from '@/compartido/ui/Iconos'
import { Pestanas } from '@/compartido/ui/Pestanas'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { FormContacto } from '../componentes/FormContacto'
import { FormEnlaces } from '../componentes/FormEnlaces'
import { FormRedes } from '../componentes/FormRedes'

const SECCIONES = [
  { id: 'contacto', titulo: 'Datos de contacto' },
  { id: 'redes', titulo: 'Redes sociales' },
  { id: 'enlaces', titulo: 'Enlaces de interés' },
]

export function GestionConfiguracion() {
  const { data, isPending, isError, refetch } = useConfiguracion()
  const editable = usePermiso('configuracion.editar')
  const [parametros, setParametros] = useSearchParams()
  const pedida = parametros.get('seccion')
  const activa = SECCIONES.some((s) => s.id === pedida) ? pedida! : SECCIONES[0].id

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-x-6">
        <TituloPagina titulo="Datos de contacto y enlaces" subtitulo="Se muestran en el pie de todas las páginas y en la página de contacto." />
        <Link
          to="/contacto"
          target="_blank"
          className="mb-6 inline-flex items-center gap-2 rounded-tema border border-borde px-4 py-2 text-sm font-semibold text-titulo transition-colors hover:border-titulo"
        >
          Ver en el portal <IconoExterno width={16} height={16} />
        </Link>
      </div>

      {!editable && (
        <p className="mb-6 rounded-tema border border-borde-tarjeta bg-tarjeta p-4 text-sm text-texto-suave sombra-suave">
          Su rol puede ver esta configuración, pero no modificarla.
        </p>
      )}

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
            etiqueta="Secciones de la configuración"
            opciones={SECCIONES}
            activa={activa}
            alCambiar={(id) => setParametros({ seccion: id }, { replace: true })}
          />

          {/* Los paneles ocultos siguen montados: cambiar de pestaña no pierde lo escrito */}
          <div role="tabpanel" id="panel-contacto" aria-labelledby="pestana-contacto" hidden={activa !== 'contacto'} className="pt-6">
            <FormContacto contacto={data.contacto} editable={editable} />
          </div>
          <div role="tabpanel" id="panel-redes" aria-labelledby="pestana-redes" hidden={activa !== 'redes'} className="pt-6">
            <FormRedes redes={data.redes} editable={editable} />
          </div>
          <div role="tabpanel" id="panel-enlaces" aria-labelledby="pestana-enlaces" hidden={activa !== 'enlaces'} className="pt-6">
            <FormEnlaces enlaces={data.enlaces} editable={editable} />
          </div>
        </>
      )}
    </div>
  )
}
