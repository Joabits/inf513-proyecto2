import { Link, useSearchParams } from 'react-router'
import { Boton } from '@/compartido/ui/Boton'
import { EstadoCarga, MensajeError } from '@/compartido/ui/EstadoCarga'
import { IconoExterno } from '@/compartido/ui/Iconos'
import { Pestanas } from '@/compartido/ui/Pestanas'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { FormAccesos } from '../componentes/FormAccesos'
import { FormCifras } from '../componentes/FormCifras'
import { FormContenido } from '../componentes/FormContenido'
import { GestorBanner } from '../componentes/GestorBanner'
import { useInicio } from '../useInicio'

const SECCIONES = [
  { id: 'contenido', titulo: 'Presentación y mensaje' },
  { id: 'banner', titulo: 'Banner' },
  { id: 'cifras', titulo: 'Cifras' },
  { id: 'accesos', titulo: 'Accesos rápidos' },
]

export function GestionInicio() {
  const { data, isPending, isError, refetch } = useInicio()
  const [parametros, setParametros] = useSearchParams()
  const pedida = parametros.get('seccion')
  const activa = SECCIONES.some((s) => s.id === pedida) ? pedida! : SECCIONES[0].id

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-x-6">
        <TituloPagina titulo="Página de inicio" subtitulo="Contenido que ven los visitantes en la portada del portal." />
        <Link
          to="/"
          target="_blank"
          className="mb-6 inline-flex items-center gap-2 rounded-tema border border-borde px-4 py-2 text-sm font-semibold text-titulo transition-colors hover:border-titulo"
        >
          Ver portada <IconoExterno width={16} height={16} />
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
            etiqueta="Secciones de la portada"
            opciones={SECCIONES}
            activa={activa}
            alCambiar={(id) => setParametros({ seccion: id }, { replace: true })}
          />

          {/* Los paneles ocultos siguen montados: cambiar de pestaña no pierde lo escrito */}
          <div role="tabpanel" id="panel-contenido" aria-labelledby="pestana-contenido" hidden={activa !== 'contenido'} className="pt-6">
            <FormContenido portada={data.portada} />
          </div>
          <div role="tabpanel" id="panel-banner" aria-labelledby="pestana-banner" hidden={activa !== 'banner'} className="pt-6">
            <GestorBanner banners={data.banners} />
          </div>
          <div role="tabpanel" id="panel-cifras" aria-labelledby="pestana-cifras" hidden={activa !== 'cifras'} className="pt-6">
            <FormCifras cifras={data.cifras} />
          </div>
          <div role="tabpanel" id="panel-accesos" aria-labelledby="pestana-accesos" hidden={activa !== 'accesos'} className="pt-6">
            <FormAccesos accesos={data.accesos} />
          </div>
        </>
      )}
    </div>
  )
}
