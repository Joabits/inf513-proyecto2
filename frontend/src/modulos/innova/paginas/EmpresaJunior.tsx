import { useState } from 'react'
import { Boton } from '@/compartido/ui/Boton'
import { ChipIcono } from '@/compartido/ui/ChipIcono'
import { EstadoCarga, MensajeError } from '@/compartido/ui/EstadoCarga'
import { IconoBandeja, IconoCorreo, IconoEnviar, IconoFlecha, IconoObjetivo, IconoVision } from '@/compartido/ui/Iconos'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { FormSolicitud } from '../componentes/FormSolicitud'
import { parrafos } from '../formato'
import { useInnova } from '../useInnova'

const ANTETITULO = 'text-sm font-bold uppercase tracking-widest text-acento'

const PASOS = [
  { icono: IconoEnviar, texto: 'Envíe su solicitud con el formulario.' },
  { icono: IconoBandeja, texto: 'El equipo de INNOVA la revisa.' },
  { icono: IconoCorreo, texto: 'Le respondemos a su correo electrónico.' },
]

/** Página pública de la Empresa Junior INNOVA (CU-22) con su formulario de solicitud (CU-09). */
export function EmpresaJunior() {
  const { data, isPending, isError, refetch } = useInnova()
  const [elegido, setElegido] = useState<number | null>(null)

  if (isPending) return <EstadoCarga />

  if (isError) {
    return (
      <div className="mx-auto max-w-xl space-y-4 py-16 text-center">
        <MensajeError texto="No se pudo cargar la información de INNOVA." />
        <Boton variante="borde" onClick={() => refetch()}>
          Reintentar
        </Boton>
      </div>
    )
  }

  const { contenido, servicios } = data
  const recibe = contenido?.recibe_solicitudes ?? true

  function solicitar(id: number) {
    setElegido(id)
    document.getElementById('solicitud')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    document.getElementById('solicitud-nombre')?.focus({ preventScroll: true })
  }

  const proposito = [
    { titulo: 'Misión', texto: contenido?.mision, icono: IconoObjetivo },
    { titulo: 'Visión', texto: contenido?.vision, icono: IconoVision },
  ].filter((item) => !!item.texto)

  return (
    <div className="mx-auto max-w-6xl">
      <TituloPagina titulo="Empresa Junior INNOVA" subtitulo="La Empresa Junior de la Carrera de Administración de Empresas." />

      {contenido && (
        <section aria-labelledby="titulo-presentacion" className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
          <div>
            <h2 id="titulo-presentacion" className={ANTETITULO}>
              Quiénes somos
            </h2>
            <div className="mt-4 space-y-4 text-lg leading-relaxed text-texto">
              {parrafos(contenido.presentacion).map((parrafo, i) => (
                // Texto fijo que no se reordena: la posición sirve como clave
                <p key={i}>{parrafo}</p>
              ))}
            </div>
          </div>
          {proposito.length > 0 && (
            <div className="space-y-4 self-start">
              {proposito.map(({ titulo, texto, icono }) => (
                <article key={titulo} className="flex gap-4 rounded-tema border border-borde bg-tarjeta p-5 sombra-suave">
                  <ChipIcono icono={icono} />
                  <div>
                    <h3 className="text-lg text-titulo">{titulo}</h3>
                    <p className="mt-1 text-texto">{texto}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {servicios.length > 0 && (
        <section aria-labelledby="titulo-servicios" className="banda banda-seccion mt-14 py-14 md:mt-20 md:py-16">
          <p className={ANTETITULO}>Lo que hacemos</p>
          <h2 id="titulo-servicios" className="mt-2 text-3xl text-titulo">
            Servicios
          </h2>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {servicios.map((servicio, i) => (
              <li
                key={servicio.id}
                className="flex flex-col rounded-tema border border-borde bg-tarjeta p-6 sombra-suave transition hover:-translate-y-1 hover:border-primario hover:sombra-elevada motion-reduce:hover:translate-y-0"
              >
                <span aria-hidden="true" className="grid h-11 w-11 place-items-center rounded-tema bg-chip font-titulos text-sm font-extrabold text-sobre-chip">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-5 text-xl text-titulo">{servicio.nombre}</h3>
                <p className="mt-2 flex-1 text-texto-suave">{servicio.descripcion}</p>
                {recibe && (
                  <button
                    type="button"
                    onClick={() => solicitar(servicio.id)}
                    className="group mt-6 inline-flex items-center gap-2 self-start font-semibold text-acento underline-offset-4 hover:underline"
                  >
                    Solicitar este servicio
                    <IconoFlecha width={18} height={18} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section id="solicitud" aria-labelledby="titulo-solicitud" className="mt-14 grid scroll-mt-24 gap-8 md:mt-20 lg:grid-cols-[1fr_1.6fr] lg:gap-14">
        <div>
          <p className={ANTETITULO}>Trabajemos juntos</p>
          <h2 id="titulo-solicitud" className="mt-2 text-3xl text-titulo">
            Solicite un servicio
          </h2>
          <p className="mt-3 text-texto-suave">Cuéntenos qué necesita y su organización. Así funciona:</p>
          <ol className="mt-6 space-y-4">
            {PASOS.map(({ icono, texto }, i) => (
              <li key={texto} className="flex items-center gap-4">
                <ChipIcono icono={icono} tamano="sm" />
                <span className="text-texto">
                  <strong className="text-titulo">{i + 1}.</strong> {texto}
                </span>
              </li>
            ))}
          </ol>
          {contenido?.correo && (
            <p className="mt-7 flex items-center gap-2 text-texto">
              <IconoCorreo width={18} height={18} aria-hidden="true" className="text-titulo" />
              <a href={`mailto:${contenido.correo}`} className="font-semibold text-titulo underline-offset-4 hover:text-acento hover:underline">
                {contenido.correo}
              </a>
            </p>
          )}
        </div>

        {recibe ? (
          <FormSolicitud servicios={servicios} servicioElegido={elegido} />
        ) : (
          <p role="status" className="self-start rounded-tema border border-dashed border-borde p-6 text-texto-suave">
            Por ahora INNOVA no está recibiendo solicitudes nuevas. Vuelva a visitarnos más adelante.
          </p>
        )}
      </section>
    </div>
  )
}
