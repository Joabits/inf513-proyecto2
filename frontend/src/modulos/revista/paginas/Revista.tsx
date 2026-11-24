import { Boton } from '@/compartido/ui/Boton'
import { ChipIcono } from '@/compartido/ui/ChipIcono'
import { EstadoCarga, MensajeError } from '@/compartido/ui/EstadoCarga'
import { IconoRevista } from '@/compartido/ui/Iconos'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { useIrAlAncla } from '@/compartido/navegacion/useIrAlAncla'
import { TarjetaEdicion } from '../componentes/TarjetaEdicion'
import { parrafos } from '../formato'
import { useRevistaPublica } from '../useRevista'

const ANTETITULO = 'text-sm font-bold uppercase tracking-widest text-acento'

function Parrafos({ texto, className = '' }: { texto: string; className?: string }) {
  return (
    <div className={`space-y-4 leading-relaxed text-texto ${className}`}>
      {parrafos(texto).map((parrafo, i) => (
        // Texto fijo que no se reordena: la posición sirve como clave
        <p key={i}>{parrafo}</p>
      ))}
    </div>
  )
}

/** Página pública «Revista INNOVAR» (CU-21): presentación, ediciones publicadas e información para colaboradores. */
export function Revista() {
  const { data, isPending, isError, refetch } = useRevistaPublica()
  // Desde el buscador se llega a una edición concreta (#edicion-3)
  useIrAlAncla(!!data)

  if (isPending) return <EstadoCarga />

  if (isError) {
    return (
      <div className="mx-auto max-w-xl space-y-4 py-16 text-center">
        <MensajeError texto="No se pudo cargar la revista." />
        <Boton variante="borde" onClick={() => refetch()}>
          Reintentar
        </Boton>
      </div>
    )
  }

  const { revista, ediciones } = data

  return (
    <div className="mx-auto max-w-6xl">
      <TituloPagina titulo="Revista INNOVAR" subtitulo="Revista Académica Institucional de la Carrera de Administración de Empresas." />

      {revista && (
        <section aria-labelledby="titulo-presentacion" className="mb-14 md:mb-20">
          <h2 id="titulo-presentacion" className={ANTETITULO}>
            Presentación
          </h2>
          <Parrafos texto={revista.presentacion} className="mt-4 max-w-3xl text-lg md:text-xl" />
        </section>
      )}

      <section aria-labelledby="titulo-ediciones" className="mb-14 md:mb-20">
        <p className={ANTETITULO}>Publicaciones</p>
        <h2 id="titulo-ediciones" className="mt-2 text-3xl text-titulo">
          Ediciones
        </h2>

        {ediciones.length > 0 ? (
          <ul className="mt-8 space-y-6">
            {ediciones.map((edicion) => (
              <li key={edicion.id}>
                <TarjetaEdicion edicion={edicion} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-8 flex items-center gap-4 rounded-tema border border-borde-tarjeta bg-tarjeta p-6 sombra-suave">
            <ChipIcono icono={IconoRevista} />
            <p className="text-texto">
              <span className="block font-semibold text-titulo">Las ediciones se publicarán pronto</span>
              Aquí aparecerán los números de la revista y sus artículos.
            </p>
          </div>
        )}
      </section>

      {revista?.colaboradores && (
        <section aria-labelledby="titulo-colaboradores" className="rounded-tema border border-borde-tarjeta bg-tarjeta p-6 sombra-suave md:p-8">
          <h2 id="titulo-colaboradores" className="text-2xl text-titulo">
            Información para colaboradores
          </h2>
          <Parrafos texto={revista.colaboradores} className="mt-4" />
        </section>
      )}
    </div>
  )
}
