import { Link } from 'react-router'
import { Boton } from '@/compartido/ui/Boton'
import { EstadoCarga, MensajeError } from '@/compartido/ui/EstadoCarga'
import { IconoFlecha } from '@/compartido/ui/Iconos'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { LineaTiempo } from '../componentes/LineaTiempo'
import { fechaLarga, parrafos } from '../formato'
import { useInstitucional } from '../useInstitucional'

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

/** Página pública «La Carrera» (información institucional, CU-27). */
export function LaCarrera() {
  const { data, isPending, isError, refetch } = useInstitucional()

  if (isPending) return <EstadoCarga />

  if (isError) {
    return (
      <div className="mx-auto max-w-xl space-y-4 py-16 text-center">
        <MensajeError texto="No se pudo cargar la información de la Carrera." />
        <Boton variante="borde" onClick={() => refetch()}>
          Reintentar
        </Boton>
      </div>
    )
  }

  const { contenido, hitos } = data

  if (!contenido) {
    return (
      <div className="mx-auto max-w-5xl">
        <TituloPagina titulo="La Carrera" />
        <p className="text-texto-suave">La información de la Carrera se publicará pronto.</p>
      </div>
    )
  }

  const datos = [
    contenido.fecha_creacion && { etiqueta: 'Fundada el', valor: fechaLarga(contenido.fecha_creacion) },
    contenido.resolucion && { etiqueta: 'Reconocida mediante', valor: contenido.resolucion },
    contenido.acreditacion && { etiqueta: 'Calidad', valor: contenido.acreditacion },
  ].filter((dato) => !!dato)

  return (
    <div className="mx-auto max-w-6xl">
      <TituloPagina titulo="La Carrera" subtitulo="Administración de Empresas · Facultad de Ciencias Económicas y Empresariales · UAGRM" />

      <section aria-label="Presentación" className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
        <Parrafos texto={contenido.presentacion} className="text-lg md:text-xl" />
        {datos.length > 0 && (
          <dl className="grid gap-px self-start overflow-hidden rounded-tema border border-borde bg-borde">
            {datos.map(({ etiqueta, valor }) => (
              <div key={etiqueta} className="bg-fondo p-5">
                <dt className="text-sm text-texto-suave">{etiqueta}</dt>
                <dd className="mt-1 font-bold text-titulo">{valor}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <section aria-label="Misión y visión" className="mt-14 grid gap-6 md:grid-cols-2">
        {[
          ['Misión', contenido.mision],
          ['Visión', contenido.vision],
        ].map(([titulo, texto]) => (
          <article key={titulo} className="rounded-tema border-l-4 border-primario bg-superficie p-6 md:p-8">
            <h2 className="text-2xl text-titulo">{titulo}</h2>
            <Parrafos texto={texto} className="mt-3" />
          </article>
        ))}
      </section>

      <section aria-labelledby="titulo-historia" className="mt-16 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
        <div>
          <h2 id="titulo-historia" className="text-3xl text-titulo">
            Reseña histórica
          </h2>
          <Parrafos texto={contenido.resena_historica} className="mt-5" />
        </div>
        {hitos.length > 0 && (
          <div>
            <h2 className="mb-6 text-sm font-bold uppercase tracking-wider text-titulo">Hitos</h2>
            <LineaTiempo hitos={hitos} />
          </div>
        )}
      </section>

      <section aria-label="Perfil y campo ocupacional" className="mt-16 grid gap-10 border-t border-borde pt-12 md:grid-cols-2">
        <div>
          <h2 className="text-2xl text-titulo">Perfil profesional</h2>
          <Parrafos texto={contenido.perfil_profesional} className="mt-4" />
        </div>
        <div>
          <h2 className="text-2xl text-titulo">Campo ocupacional</h2>
          <Parrafos texto={contenido.campo_ocupacional} className="mt-4" />
        </div>
      </section>

      <section className="mt-16 flex flex-col items-start justify-between gap-5 rounded-tema bg-marino p-6 text-sobre-primario md:flex-row md:items-center md:p-10">
        <div>
          <h2 className="text-2xl">¿Quiere estudiar Administración de Empresas?</h2>
          <p className="mt-1">Revise el plan de estudios 101-4 y escríbanos si tiene dudas.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/malla-curricular"
            className="inline-flex items-center gap-2 rounded-tema bg-primario px-5 py-3 font-semibold text-sobre-primario transition-colors hover:bg-marino-oscuro"
          >
            Ver malla curricular <IconoFlecha width={18} height={18} />
          </Link>
          <Link to="/contacto" className="inline-flex rounded-tema border border-sobre-primario px-5 py-3 font-semibold transition-colors hover:bg-marino-oscuro">
            Contacto
          </Link>
        </div>
      </section>
    </div>
  )
}
