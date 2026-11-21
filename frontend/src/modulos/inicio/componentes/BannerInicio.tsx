import { useState } from 'react'
import { IconoAnterior, IconoSiguiente } from '@/compartido/ui/Iconos'
import type { Banner } from '../tipos'
import { EnlaceInicio } from './EnlaceInicio'

const CONTROL = 'grid h-10 w-10 place-items-center rounded-full bg-fondo text-titulo shadow transition-colors hover:text-acento'

/**
 * Carrusel manual: no avanza solo, para que cada persona lea a su ritmo.
 *
 * Va de borde a borde de la ventana y pegado a la cabecera, como en los portales de otras facultades; el resto de la
 * página sigue en su columna centrada. Para salir de esa columna sin tocar la plantilla común se usa el ancho de la
 * ventana (w-screen) centrado sobre la columna; la plantilla ya recorta lo que sobra (overflow-x-clip).
 * La altura crece con el ancho pero se detiene en 520 px: una foto panorámica a 1920 px sin tope taparía toda la pantalla.
 */
export function BannerInicio({ banners }: { banners: Banner[] }) {
  const [elegido, setElegido] = useState(0)
  const total = banners.length
  const actual = Math.min(elegido, total - 1)

  return (
    <section aria-roledescription="carrusel" aria-label="Imágenes de la Carrera" className="relative -mt-8 mb-10 ml-[calc(50%-50vw)] w-screen md:-mt-12 md:mb-14">
      <div className="relative aspect-video overflow-hidden bg-superficie md:aspect-auto md:h-[clamp(320px,28vw,520px)]">
        {banners.map((banner, i) => {
          const imagen = (
            <img
              src={banner.imagen}
              alt={banner.texto_alternativo}
              loading={i === 0 ? 'eager' : 'lazy'}
              className="h-full w-full object-cover"
            />
          )

          return (
            <div
              key={banner.id}
              inert={i !== actual}
              aria-hidden={i !== actual}
              className={`absolute inset-0 motion-safe:transition-opacity motion-safe:duration-500 ${i === actual ? 'opacity-100' : 'opacity-0'}`}
            >
              {banner.enlace ? <EnlaceInicio destino={banner.enlace}>{imagen}</EnlaceInicio> : imagen}
            </div>
          )
        })}
      </div>

      {total > 1 && (
        <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-3">
          <button type="button" className={CONTROL} aria-label="Imagen anterior" onClick={() => setElegido((actual - 1 + total) % total)}>
            <IconoAnterior />
          </button>
          <p className="rounded-full bg-fondo px-3 py-1 text-sm font-semibold text-titulo shadow" aria-live="polite">
            {actual + 1} de {total}
          </p>
          <button type="button" className={CONTROL} aria-label="Imagen siguiente" onClick={() => setElegido((actual + 1) % total)}>
            <IconoSiguiente />
          </button>
        </div>
      )}
    </section>
  )
}
