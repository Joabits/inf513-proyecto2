import { Link } from 'react-router'
import { Calendar, User } from 'lucide-react'
import type { Noticia } from '../tipos'

interface TarjetaNoticiaProps {
  noticia: Noticia
}

export function TarjetaNoticia({ noticia }: TarjetaNoticiaProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-tema border border-borde bg-fondo font-montserrat shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      {noticia.imagen ? (
        <div className="relative aspect-video w-full overflow-hidden bg-marino-oscuro">
          <img
            src={noticia.imagen}
            alt={noticia.titulo}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="flex aspect-video w-full items-center justify-center bg-marino text-sobre-primario">
          <span className="text-sm font-medium">UAGRM Noticias</span>
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center gap-4 text-xs text-texto opacity-75">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-acento" />
            {noticia.publicada_en || noticia.creada_en}
          </span>
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5 text-acento" />
            {noticia.autor}
          </span>
        </div>

        <h3 className="mb-2 line-clamp-2 text-lg font-bold text-titulo transition-colors group-hover:text-acento">
          <Link to={`/noticias/${noticia.id}`}>
            {noticia.titulo}
          </Link>
        </h3>

        <p className="mb-4 line-clamp-3 flex-1 text-sm text-texto">
          {noticia.resumen}
        </p>

        <div className="pt-2">
          <Link
            to={`/noticias/${noticia.id}`}
            className="inline-flex items-center text-sm font-semibold text-acento hover:underline"
          >
            Leer más &rarr;
          </Link>
        </div>
      </div>
    </article>
  )
}
