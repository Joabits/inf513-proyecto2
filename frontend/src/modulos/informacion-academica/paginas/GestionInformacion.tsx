import { Link } from 'react-router'
import { Boton } from '@/compartido/ui/Boton'
import { EstadoCarga, MensajeError } from '@/compartido/ui/EstadoCarga'
import { IconoExterno } from '@/compartido/ui/Iconos'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { useInformacion } from '../hooks/useInformacion'
import { FormularioInformacion } from '../componentes/FormularioInformacion'

export function GestionInformacion() {
  const { data: informacion, isPending, isError, refetch } = useInformacion()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <TituloPagina
          titulo="Gestión de Información Académica"
          subtitulo="Actualice la misión, visión, perfil profesional y campo ocupacional de la carrera."
        />
        <Link
          to="/informacion-academica"
          target="_blank"
          className="inline-flex items-center gap-2 rounded-tema border border-borde bg-fondo px-4 py-2 text-sm font-semibold text-titulo transition-colors hover:border-titulo"
        >
          Ver vista pública <IconoExterno width={16} height={16} />
        </Link>
      </div>

      {isPending && <EstadoCarga />}

      {isError && (
        <div className="space-y-4 text-center">
          <MensajeError texto="No se pudo cargar la información académica." />
          <Boton variante="borde" onClick={() => refetch()}>
            Reintentar
          </Boton>
        </div>
      )}

      {!isPending && !isError && (
        <div className="rounded-tema border border-borde bg-fondo p-6">
          <FormularioInformacion informacion={informacion ?? null} />
        </div>
      )}
    </div>
  )
}
