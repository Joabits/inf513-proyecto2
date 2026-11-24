import { useConfiguracion } from '@/compartido/configuracion/useConfiguracion'
import { IconoExterno, IconoUbicacion } from '@/compartido/ui/Iconos'

/**
 * Qué buscar en el mapa. Sale del enlace que el personal carga en «Datos de contacto y enlaces» (CU-28):
 * ?query= / ?q= / ?destination= o coordenadas @lat,lng. Si no hay enlace, la dirección escrita.
 */
function lugarDelMapa(mapaUrl: string | null, direccion: string, ciudad: string): string {
  if (mapaUrl) {
    try {
      const url = new URL(mapaUrl)
      const parametro = url.searchParams.get('query') ?? url.searchParams.get('q') ?? url.searchParams.get('destination')
      if (parametro) return parametro
      const coordenadas = url.pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
      if (coordenadas) return `${coordenadas[1]},${coordenadas[2]}`
    } catch {
      // Enlace inválido: se usa la dirección
    }
  }
  return `${direccion}, ${ciudad}`
}

/**
 * Mapa de Google Maps con la ubicación de la Carrera y botones para llegar.
 * El mapa carga recién cuando la persona baja hasta él (loading="lazy"), para no hacer lenta la página.
 */
export function MapaUbicacion() {
  const { data } = useConfiguracion()
  const contacto = data?.contacto
  if (!contacto) return null

  const lugar = lugarDelMapa(contacto.mapa_url, contacto.direccion, contacto.ciudad)
  const consulta = encodeURIComponent(lugar)
  const comoLlegar = `https://www.google.com/maps/dir/?api=1&destination=${consulta}`
  const abrir = `https://www.google.com/maps/search/?api=1&query=${consulta}`

  return (
    <section id="mapa" aria-labelledby="titulo-mapa" className="mt-10 overflow-hidden rounded-tema border border-borde-tarjeta bg-tarjeta sombra-suave md:mt-12">
      <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex gap-4">
          <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center text-acento [&>svg]:h-full [&>svg]:w-full" aria-hidden="true">
            <IconoUbicacion />
          </span>
          <div className="min-w-0">
            <h2 id="titulo-mapa" className="text-2xl text-titulo">
              Cómo llegar
            </h2>
            <p className="mt-1 text-sm text-texto-suave">
              {[contacto.direccion, contacto.referencia, contacto.ciudad].filter(Boolean).join(', ')}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href={comoLlegar}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-tema bg-primario px-5 py-2.5 text-sm font-semibold text-sobre-primario transition-colors hover:bg-marino"
          >
            Cómo llegar <IconoExterno width={16} height={16} aria-hidden="true" />
          </a>
          <a
            href={abrir}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-tema border border-borde px-5 py-2.5 text-sm font-semibold text-titulo transition-colors hover:border-primario hover:text-acento"
          >
            Abrir en Google Maps
          </a>
        </div>
      </div>

      <iframe
        title={`Mapa: ${contacto.direccion}, ${contacto.ciudad}`}
        src={`https://www.google.com/maps?q=${consulta}&z=17&hl=es&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="block h-80 w-full border-0 bg-superficie md:h-[26rem]"
      />
    </section>
  )
}
