import { Link } from 'react-router'
import { iconoDeRuta } from '@/compartido/menu/iconosRuta'
import { Boton } from '@/compartido/ui/Boton'
import { ChipIcono } from '@/compartido/ui/ChipIcono'
import { MensajeError } from '@/compartido/ui/EstadoCarga'
import { IconoExterno, IconoFlecha, IconoVerificado } from '@/compartido/ui/Iconos'
import { BannerInicio } from '../componentes/BannerInicio'
import { EnlaceInicio } from '../componentes/EnlaceInicio'
import { EsqueletoInicio } from '../componentes/EsqueletoInicio'
import { MensajeDirector } from '../componentes/MensajeDirector'
import { useInicio } from '../useInicio'

const BOTON = 'inline-flex items-center justify-center gap-2 rounded-tema px-6 py-3 font-semibold transition-colors'

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

  const { portada, banners, cifras, accesos } = data

  return (
    <>
      <title>Administración de Empresas | FCEE - UAGRM</title>

      {!portada && banners.length > 0 && <BannerInicio banners={banners} />}

      {portada && (
        // Franja azul pegada a la cabecera (sube con -mt hasta ella)
        <section aria-labelledby="titulo-portada" className="banda banda-marino -mt-8 overflow-y-clip pb-14 pt-10 md:-mt-12 md:pb-20 md:pt-16">
          <span
            aria-hidden="true"
            className="adorno pointer-events-none absolute -right-40 -top-40 hidden h-[36rem] w-[36rem] rounded-full bg-marino-oscuro lg:block"
          />

          {banners.length > 0 && (
            <div className="relative">
              <BannerInicio banners={banners} />
            </div>
          )}

          <div className={`relative grid items-center gap-10 lg:gap-16 ${cifras.length > 0 ? 'lg:grid-cols-[1.25fr_1fr]' : ''}`}>
            <div>
              {portada.distintivo && (
                <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-sobre-marino-suave px-3.5 py-1.5 text-sm font-semibold">
                  <IconoVerificado width={16} height={16} aria-hidden="true" />
                  {portada.distintivo}
                </p>
              )}
              <h1 id="titulo-portada" className="text-4xl leading-tight sm:text-5xl lg:text-6xl">
                {portada.titulo}
              </h1>
              <span aria-hidden="true" className="mt-6 block h-1 w-16 rounded-full bg-primario" />
              <p className="mt-6 max-w-xl text-base leading-relaxed text-sobre-marino-suave sm:text-lg">{portada.presentacion}</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link to="/malla-curricular" className={`${BOTON} bg-primario text-sobre-primario hover:bg-marino-oscuro`}>
                  Ver malla curricular <IconoFlecha width={18} height={18} aria-hidden="true" />
                </Link>
                <Link to="/contacto" className={`${BOTON} border border-sobre-marino hover:bg-sobre-marino hover:text-marino`}>
                  Contacto
                </Link>
              </div>
            </div>

            {cifras.length > 0 && (
              <dl className="grid grid-cols-2 gap-3 sm:gap-4 [&>div:last-child:nth-child(odd)]:col-span-2">
                {cifras.map((cifra) => (
                  <div key={cifra.etiqueta} className="flex flex-col-reverse rounded-tema border border-marino bg-marino-oscuro p-5 sm:p-7">
                    <dt className="mt-1 text-sm text-sobre-marino-suave">{cifra.etiqueta}</dt>
                    <dd className="font-titulos text-3xl font-extrabold sm:text-4xl">{cifra.valor}</dd>
                    <span aria-hidden="true" className="mb-4 block h-1 w-8 rounded-full bg-primario" />
                  </div>
                ))}
              </dl>
            )}
          </div>
        </section>
      )}

      {portada && <MensajeDirector portada={portada} />}

      {accesos.length > 0 && (
        <section aria-labelledby="explora" className="mt-14 md:mt-20">
          <p className="text-sm font-bold uppercase tracking-widest text-acento">Accesos rápidos</p>
          <h2 id="explora" className="mt-2 text-3xl text-titulo">
            Explora la Carrera
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {accesos.map((acceso) => {
              const externo = !acceso.ruta.startsWith('/')
              const Icono = (externo ? IconoExterno : iconoDeRuta(acceso.ruta)) ?? IconoFlecha
              return (
                <EnlaceInicio
                  key={acceso.titulo}
                  destino={acceso.ruta}
                  className="group flex flex-col rounded-tema border border-borde bg-tarjeta p-6 sombra-suave transition hover:-translate-y-1 hover:border-primario hover:sombra-elevada motion-reduce:hover:translate-y-0"
                >
                  <ChipIcono icono={Icono} className="transition-colors group-hover:bg-primario" />
                  <h3 className="mt-5 text-lg text-titulo group-hover:text-acento">{acceso.titulo}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-texto-suave">{acceso.descripcion}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-acento">
                    Ver más <IconoFlecha width={16} height={16} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
                  </span>
                </EnlaceInicio>
              )
            })}
          </div>
        </section>
      )}
    </>
  )
}
