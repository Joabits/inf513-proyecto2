import { useState } from 'react'
import { IconoAnterior, IconoSiguiente } from '@/compartido/ui/Iconos'
import type { Banner } from '../tipos'
import { EnlaceInicio } from './EnlaceInicio'

const CONTROL = 'grid h-10 w-10 place-items-center rounded-full bg-fondo text-titulo shadow transition-colors hover:text-acento'

/** Carrusel manual: no avanza solo, para que cada persona lea a su ritmo. */
export function BannerInicio({ banners }: { banners: Banner[] }) {
  const [elegido, setElegido] = useState(0)
  const total = banners.length
  const actual = Math.min(elegido, total - 1)

  return (
    <section aria-roledescription="carrusel" aria-label="Imágenes de la Carrera" className="relative mb-10 md:mb-14">
      <div className="relative aspect-video overflow-hidden rounded-tema bg-superficie md:aspect-[21/8]">
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
