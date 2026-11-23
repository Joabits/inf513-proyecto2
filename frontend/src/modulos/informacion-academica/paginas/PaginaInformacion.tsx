import { Boton } from '@/compartido/ui/Boton'
import { EstadoCarga, MensajeError } from '@/compartido/ui/EstadoCarga'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { useInformacion } from '../hooks/useInformacion'

function Parrafos({ texto }: { texto: string }) {
  const lineas = texto.split('\n').filter((l) => l.trim().length > 0)
  return (
    <div className="space-y-3 leading-relaxed text-texto">
      {lineas.map((parrafo, i) => (
        <p key={i}>{parrafo}</p>
      ))}
    </div>
  )
}

export function PaginaInformacion() {
  const { data: informacion, isPending, isError, refetch } = useInformacion()

  if (isPending) return <EstadoCarga />

  if (isError) {
    return (
      <div className="mx-auto max-w-xl space-y-4 py-16 text-center">
        <MensajeError texto="No se pudo cargar la información académica." />
        <Boton variante="borde" onClick={() => refetch()}>
          Reintentar
        </Boton>
      </div>
    )
  }

  const vacio =
    !informacion ||
    (!informacion.mision && !informacion.vision && !informacion.perfil_profesional && !informacion.objetivos)

  return (
    <div className="mx-auto max-w-5xl space-y-10 py-6">
      <header className="border-b border-borde pb-6">
        <TituloPagina
          titulo="Información Académica"
          subtitulo="Conozca la misión, visión, perfil profesional y objetivos formativos que guían nuestra propuesta educativa."
        />
        {informacion?.actualizado_en && (
          <p className="mt-2 text-xs text-texto">
            Última actualización: {informacion.actualizado_en}
            {informacion.autor ? ` por ${informacion.autor}` : ''}
          </p>
        )}
      </header>

      {vacio ? (
        <div className="rounded-tema border border-borde bg-fondo p-10 text-center">
          <p className="text-lg font-semibold text-titulo">
            Aún no se ha registrado la información académica de la carrera.
          </p>
          <p className="mt-2 text-sm text-texto">
            La información estará disponible una vez que la dirección de carrera complete su publicación.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Misión */}
          <section className="rounded-tema border border-borde bg-fondo p-6">
            <h2 className="mb-4 text-xl font-bold text-titulo">Misión</h2>
            <Parrafos texto={informacion.mision} />
          </section>

          {/* Visión */}
          <section className="rounded-tema border border-borde bg-fondo p-6">
            <h2 className="mb-4 text-xl font-bold text-titulo">Visión</h2>
            <Parrafos texto={informacion.vision} />
          </section>

          {/* Perfil Profesional */}
          <section className="rounded-tema border border-borde bg-fondo p-6 md:col-span-2">
            <h2 className="mb-4 text-xl font-bold text-titulo">Perfil Profesional</h2>
            <Parrafos texto={informacion.perfil_profesional} />
          </section>

          {/* Objetivos */}
          <section className="rounded-tema border border-borde bg-fondo p-6 md:col-span-2">
            <h2 className="mb-4 text-xl font-bold text-titulo">Campo Ocupacional</h2>
            <Parrafos texto={informacion.objetivos} />
          </section>
        </div>
      )}
    </div>
  )
}
