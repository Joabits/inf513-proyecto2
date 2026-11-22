import { Link } from 'react-router'
import { IconoCalendario, IconoNoticias } from '@/compartido/ui/Iconos'
import type { Noticia } from '../tipos'

/**
 * Toda la tarjeta es un solo enlace (antes había dos al mismo destino, el título y «Leer más»).
 * Mismo comportamiento que las tarjetas de la portada: sube 2 px, la sombra crece y el foco de teclado se ve.
 */
export function TarjetaNoticia({ noticia }: { noticia: Noticia }) {
  const fecha = noticia.publicada_en || noticia.creada_en

  return (
    <Link
      to={`/noticias/${noticia.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-tema border border-borde-tarjeta bg-tarjeta sombra-suave transition duration-200 ease-out hover:-translate-y-0.5 hover:sombra-elevada focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      {noticia.imagen ? (
        <img src={noticia.imagen} alt="" loading="lazy" className="aspect-video w-full bg-fondo object-cover" />
      ) : (
        <div aria-hidden="true" className="flex aspect-video w-full items-center justify-center bg-fondo text-texto-suave">
          <IconoNoticias width={36} height={36} />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        {fecha && (
          <p className="flex items-center gap-1.5 text-sm text-texto-suave">
            <IconoCalendario width={15} height={15} aria-hidden="true" /> {fecha}
          </p>
        )}
        <h2 className="mt-2 line-clamp-2 break-words text-lg leading-snug text-titulo transition-colors duration-200 group-hover:text-acento">
          {noticia.titulo}
        </h2>
        <p className="mt-2 line-clamp-3 flex-1 break-words text-sm leading-relaxed text-texto-suave">{noticia.resumen}</p>
        <span className="mt-4 text-sm font-semibold text-acento">Leer la noticia →</span>
      </div>
    </Link>
  )
}
