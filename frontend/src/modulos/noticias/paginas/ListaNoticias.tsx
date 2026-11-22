import { useNoticias } from '../hooks/useNoticias'
import { TarjetaNoticia } from '../componentes/TarjetaNoticia'
import { Newspaper } from 'lucide-react'

export function ListaNoticias() {
  const { data: noticias, isLoading, isError } = useNoticias()

  return (
    <div className="container mx-auto px-4 py-8 font-montserrat">
      <div className="mb-8 border-b border-borde pb-4">
        <h1 className="flex items-center gap-3 text-3xl font-extrabold text-titulo">
          <Newspaper className="h-8 w-8 text-acento" />
          Noticias y Novedades
        </h1>
        <p className="mt-2 text-texto">
          Manténgase informado sobre las últimas actividades, comunicados y eventos de la carrera.
        </p>
      </div>

      {isLoading && (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primario border-t-transparent" />
        </div>
      )}

      {isError && (
        <div className="rounded-tema border border-red-500/30 bg-red-500/10 p-4 text-center text-red-500">
          No se pudieron cargar las noticias en este momento. Inténtelo más tarde.
        </div>
      )}

      {!isLoading && !isError && (!noticias || noticias.length === 0) && (
        <div className="rounded-tema border border-borde bg-fondo p-12 text-center text-texto">
          <Newspaper className="mx-auto mb-3 h-12 w-12 opacity-40 text-acento" />
          <h2 className="text-lg font-semibold text-titulo">No hay noticias publicadas</h2>
          <p className="mt-1 text-sm text-texto opacity-80">
            Pronto estaremos compartiendo nuevas noticias y actualizaciones académicas.
          </p>
        </div>
      )}

      {!isLoading && !isError && noticias && noticias.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {noticias.map((noticia) => (
            <TarjetaNoticia key={noticia.id} noticia={noticia} />
          ))}
        </div>
      )}
    </div>
  )
}
