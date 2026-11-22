import { Link, useParams } from 'react-router'
import { Boton } from '@/compartido/ui/Boton'
import { EstadoCarga, MensajeError } from '@/compartido/ui/EstadoCarga'
import { IconoAnterior, IconoCalendario } from '@/compartido/ui/Iconos'
import { useNoticia } from '../hooks/useNoticias'

const VOLVER = 'inline-flex items-center gap-2 text-sm font-semibold text-acento hover:underline'

/** Detalle público de una noticia (CU-01). Un borrador o un número inexistente responde «no encontrada». */
export function DetalleNoticia() {
  const { id } = useParams<{ id: string }>()
  const numero = Number(id)
  // Con un número inválido (/noticias/abc) la consulta no se lanza y quedaría «cargando» para siempre
  const valido = Number.isInteger(numero) && numero > 0
  const { data: noticia, isPending, isError, error, refetch } = useNoticia(numero)

  if (valido && isPending) return <EstadoCarga />

  if (!valido || isError || !noticia) {
    const noExiste = !valido || (error as { response?: { status?: number } } | null)?.response?.status === 404
    return (
      <div className="mx-auto max-w-xl space-y-4 py-16 text-center">
        <title>Noticia no encontrada | Administración de Empresas - UAGRM</title>
        <MensajeError texto={noExiste ? 'La noticia no existe o ya no está publicada.' : 'No se pudo cargar la noticia.'} />
        {noExiste ? (
          <Link to="/noticias" className={VOLVER}>
            <IconoAnterior width={16} height={16} aria-hidden="true" /> Ver todas las noticias
          </Link>
        ) : (
          <Boton variante="borde" onClick={() => refetch()}>
            Reintentar
          </Boton>
        )}
      </div>
    )
  }

  const fecha = noticia.publicada_en || noticia.creada_en

  return (
    <article className="mx-auto max-w-3xl">
      <title>{`${noticia.titulo} | Administración de Empresas - UAGRM`}</title>

      <Link to="/noticias" className={VOLVER}>
        <IconoAnterior width={16} height={16} aria-hidden="true" /> Todas las noticias
      </Link>

      <header className="mt-6">
        <span className="mb-3 block h-1 w-12 rounded-full bg-primario" aria-hidden="true" />
        <h1 className="break-words text-3xl leading-tight text-titulo md:text-4xl">{noticia.titulo}</h1>
        {fecha && (
          <p className="mt-4 flex items-center gap-1.5 text-sm text-texto-suave">
            <IconoCalendario width={15} height={15} aria-hidden="true" /> {fecha}
          </p>
        )}
      </header>

      {noticia.imagen && <img src={noticia.imagen} alt="" className="mt-8 max-h-[500px] w-full rounded-tema bg-fondo object-cover" />}

      <p className="mt-8 border-l-4 border-primario pl-4 text-lg font-medium leading-relaxed text-titulo">{noticia.resumen}</p>

      {noticia.contenido && <div className="mt-6 whitespace-pre-line break-words leading-relaxed text-texto">{noticia.contenido}</div>}
    </article>
  )
}
