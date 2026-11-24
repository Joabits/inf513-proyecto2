import { useState } from 'react'
import { IconoReproducir } from './Iconos'

/**
 * Video de YouTube liviano: primero solo la miniatura; el reproductor (y lo que carga YouTube) llega recién
 * cuando la persona pulsa «Reproducir». Usa youtube-nocookie para no dejar cookies antes de reproducir.
 */
export function VideoYoutube({ id, titulo }: { id: string; titulo: string }) {
  const [reproduciendo, setReproduciendo] = useState(false)

  return (
    <div className="relative aspect-video overflow-hidden rounded-tema bg-marino-oscuro sombra-elevada">
      {reproduciendo ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={titulo}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="h-full w-full border-0"
        />
      ) : (
        <button type="button" onClick={() => setReproduciendo(true)} aria-label={`Reproducir: ${titulo}`} className="group absolute inset-0 h-full w-full">
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover" />
          <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-primario text-sobre-primario shadow-lg ring-8 ring-white/25 transition-transform group-hover:scale-105 motion-reduce:transition-none">
            <IconoReproducir width={28} height={28} fill="currentColor" className="ml-1" aria-hidden="true" />
          </span>
        </button>
      )}
    </div>
  )
}
