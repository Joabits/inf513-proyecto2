import { useState } from 'react'
import { Boton } from '@/compartido/ui/Boton'
import { EstadoCarga, MensajeError } from '@/compartido/ui/EstadoCarga'
import { IconoCorreo, IconoFlecha } from '@/compartido/ui/Iconos'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { FormSolicitud } from '../componentes/FormSolicitud'
import { parrafos } from '../formato'
import { useInnova } from '../useInnova'

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

  return (
    <div className="mx-auto max-w-6xl">
      <TituloPagina titulo="Empresa Junior INNOVA" subtitulo="La Empresa Junior de la Carrera de Administración de Empresas." />

      {contenido && (
        <section aria-label="Presentación" className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
          <div className="space-y-4 text-lg leading-relaxed text-texto">
            {parrafos(contenido.presentacion).map((parrafo, i) => (
              // Texto fijo que no se reordena: la posición sirve como clave
              <p key={i}>{parrafo}</p>
            ))}
          </div>
          {(contenido.mision || contenido.vision) && (
            <div className="space-y-4 self-start">
              {[
                ['Misión', contenido.mision],
                ['Visión', contenido.vision],
              ].map(
                ([titulo, texto]) =>
                  texto && (
                    <article key={titulo} className="rounded-tema border-l-4 border-primario bg-superficie p-5">
                      <h2 className="text-lg text-titulo">{titulo}</h2>
                      <p className="mt-2 text-texto">{texto}</p>
                    </article>
                  ),
              )}
            </div>
          )}
        </section>
      )}

      {servicios.length > 0 && (
        <section aria-labelledby="titulo-servicios" className="mt-16">
          <h2 id="titulo-servicios" className="text-3xl text-titulo">
            Servicios
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {servicios.map((servicio, i) => (
              <li key={servicio.id} className="flex flex-col rounded-tema border border-borde p-6">
                <span className="font-titulos text-sm font-extrabold text-acento">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-2 text-xl text-titulo">{servicio.nombre}</h3>
                <p className="mt-2 flex-1 text-texto-suave">{servicio.descripcion}</p>
                {recibe && (
                  <button
                    type="button"
                    onClick={() => solicitar(servicio.id)}
                    className="mt-5 inline-flex items-center gap-2 self-start font-semibold text-titulo underline-offset-4 hover:text-acento hover:underline"
                  >
                    Solicitar este servicio <IconoFlecha width={18} height={18} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section id="solicitud" aria-labelledby="titulo-solicitud" className="mt-16 grid scroll-mt-24 gap-8 lg:grid-cols-[1fr_1.6fr] lg:gap-14">
        <div>
          <h2 id="titulo-solicitud" className="text-3xl text-titulo">
            Solicite un servicio
          </h2>
          <p className="mt-3 text-texto-suave">
            Cuéntenos qué necesita. El equipo de INNOVA revisará su solicitud y le responderá a su correo electrónico.
          </p>
          {contenido?.correo && (
            <p className="mt-5 flex items-center gap-2 text-texto">
              <IconoCorreo width={18} height={18} className="text-titulo" />
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
