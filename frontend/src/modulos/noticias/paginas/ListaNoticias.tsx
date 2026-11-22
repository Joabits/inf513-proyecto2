import { Boton } from '@/compartido/ui/Boton'
import { EstadoCarga, MensajeError } from '@/compartido/ui/EstadoCarga'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { TarjetaNoticia } from '../componentes/TarjetaNoticia'
import { useNoticias } from '../hooks/useNoticias'

/** Página pública «Noticias» (CU-01): las noticias publicadas, de la más reciente a la más antigua. */
export function ListaNoticias() {
  const { data: noticias, isPending, isError, refetch } = useNoticias()

  return (
    <div className="mx-auto max-w-6xl">
      <TituloPagina titulo="Noticias" subtitulo="Actividades, comunicados y novedades de la Carrera." />

      {isPending && <EstadoCarga />}

      {isError && (
        <div className="mx-auto max-w-xl space-y-4 py-10 text-center">
          <MensajeError texto="No se pudieron cargar las noticias." />
          <Boton variante="borde" onClick={() => refetch()}>
            Reintentar
          </Boton>
        </div>
      )}

      {noticias && noticias.length === 0 && (
        <p className="rounded-tema bg-superficie p-10 text-center text-texto-suave">Todavía no hay noticias publicadas.</p>
      )}

      {noticias && noticias.length > 0 && (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {noticias.map((noticia) => (
            <li key={noticia.id}>
              <TarjetaNoticia noticia={noticia} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
