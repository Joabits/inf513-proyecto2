import { Link } from 'react-router'
import { Boton } from '@/compartido/ui/Boton'
import { MensajeError } from '@/compartido/ui/EstadoCarga'
import { IconoFlecha } from '@/compartido/ui/Iconos'
import { EnlaceInicio } from '../componentes/EnlaceInicio'
import { EsqueletoInicio } from '../componentes/EsqueletoInicio'
import { MensajeDirector } from '../componentes/MensajeDirector'
import { useInicio } from '../useInicio'

export function Inicio() {
  const { data, isPending, isError, refetch } = useInicio()

  if (isPending) return <EsqueletoInicio />

  if (isError) {
    return (
      <div className="mx-auto max-w-xl space-y-4 py-16 text-center">
        <MensajeError texto="No se pudo cargar la portada." />
        <Boton variante="borde" onClick={() => refetch()}>
          Reintentar
        </Boton>
      </div>
    )
  }

  const { portada, cifras, accesos } = data

  return (
    <>
      <title>Administración de Empresas | FCEE - UAGRM</title>

      {portada && (
        <section className={`grid items-center gap-10 py-4 md:py-10 lg:gap-16 ${cifras.length > 0 ? 'lg:grid-cols-[1.3fr_1fr]' : ''}`}>
          <div>
            {portada.distintivo && (
              <p className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-acento">
                <span className="h-2 w-2 rounded-full bg-primario" aria-hidden="true" />
                {portada.distintivo}
              </p>
            )}
            <h1 className="text-4xl leading-tight text-titulo sm:text-5xl lg:text-6xl">{portada.titulo}</h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-texto-suave sm:text-lg">{portada.presentacion}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/malla-curricular"
                className="inline-flex items-center justify-center gap-2 rounded-tema bg-primario px-6 py-3 font-semibold text-sobre-primario transition-colors hover:bg-marino"
              >
                Ver malla curricular <IconoFlecha width={18} height={18} />
              </Link>
              <Link
                to="/contacto"
                className="inline-flex items-center justify-center rounded-tema border border-borde px-6 py-3 font-semibold text-titulo transition-colors hover:border-primario hover:text-acento"
              >
                Contacto
              </Link>
            </div>
          </div>

          {cifras.length > 0 && (
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-tema border border-borde bg-borde [&>div:last-child:nth-child(odd)]:col-span-2">
              {cifras.map((cifra) => (
                <div key={cifra.etiqueta} className="flex flex-col-reverse bg-fondo p-6 sm:p-8">
                  <dt className="mt-1 text-sm text-texto-suave">{cifra.etiqueta}</dt>
                  <dd className="font-titulos text-3xl font-extrabold text-titulo sm:text-4xl">{cifra.valor}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      )}

      {portada && <MensajeDirector portada={portada} />}

      {accesos.length > 0 && (
        <section aria-labelledby="explora" className="mt-14 md:mt-20">
          <h2 id="explora" className="mb-6 text-2xl text-titulo">
            Explora la Carrera
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {accesos.map((acceso) => (
              <EnlaceInicio
                key={acceso.titulo}
                destino={acceso.ruta}
                className="group flex flex-col rounded-tema border border-borde p-6 transition-colors hover:border-primario"
              >
                <h3 className="text-lg text-titulo group-hover:text-acento">{acceso.titulo}</h3>
                <p className="mt-2 flex-1 text-sm text-texto-suave">{acceso.descripcion}</p>
                <IconoFlecha className="mt-4 text-acento transition-transform group-hover:translate-x-1" width={18} height={18} />
              </EnlaceInicio>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
