import { Link, useParams } from 'react-router'
import { ArrowLeft, Calendar, User, Newspaper } from 'lucide-react'
import { useNoticia } from '../hooks/useNoticias'

export function DetalleNoticia() {
  const { id } = useParams<{ id: string }>()
  const idNumero = Number(id)
  const { data: noticia, isLoading, isError } = useNoticia(idNumero)

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center font-montserrat">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primario border-t-transparent" />
      </div>
    )
  }

  if (isError || !noticia) {
    return (
      <div className="container mx-auto px-4 py-12 font-montserrat">
        <div className="mx-auto max-w-2xl rounded-tema border border-borde bg-fondo p-8 text-center">
          <Newspaper className="mx-auto mb-4 h-12 w-12 text-acento opacity-50" />
          <h2 className="mb-2 text-xl font-bold text-titulo">Noticia no encontrada</h2>
          <p className="mb-6 text-sm text-texto">
            La noticia solicitada no existe o no se encuentra disponible.
          </p>
          <Link
            to="/noticias"
            className="inline-flex items-center gap-2 rounded-tema bg-primario px-4 py-2 text-sm font-semibold text-sobre-primario hover:bg-marino"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a noticias
          </Link>
        </div>
      </div>
    )
  }

  return (
    <article className="container mx-auto max-w-4xl px-4 py-10 font-montserrat">
      <div className="mb-6">
        <Link
          to="/noticias"
          className="inline-flex items-center gap-2 text-sm font-semibold text-acento hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a todas las noticias
        </Link>
      </div>

      <header className="mb-6">
        <h1 className="mb-4 text-3xl font-extrabold text-titulo md:text-4xl">
          {noticia.titulo}
        </h1>

        <div className="flex flex-wrap items-center gap-6 border-b border-borde pb-4 text-sm text-texto opacity-80">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-acento" />
            {noticia.publicada_en || noticia.creada_en}
          </span>
          <span className="flex items-center gap-1.5">
            <User className="h-4 w-4 text-acento" />
            {noticia.autor}
          </span>
        </div>
      </header>

      {noticia.imagen && (
        <div className="mb-8 overflow-hidden rounded-tema border border-borde bg-marino-oscuro">
          <img
            src={noticia.imagen}
            alt={noticia.titulo}
            className="max-h-[500px] w-full object-cover"
          />
        </div>
      )}

      <div className="mb-8 rounded-tema border-l-4 border-acento bg-fondo p-4 text-lg font-medium italic text-titulo">
        {noticia.resumen}
      </div>

      <div className="prose max-w-none whitespace-pre-line text-texto leading-relaxed">
        {noticia.contenido}
      </div>
    </article>
  )
}
