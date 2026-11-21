import { Link } from 'react-router'
import { IconoFlecha, IconoHorario, IconoNoticias, IconoUbicacion } from '@/compartido/ui/Iconos'
import type { EventoPortada, NoticiaPortada } from '../tipos'

const FECHA = new Intl.DateTimeFormat('es-BO', { day: 'numeric', month: 'long', year: 'numeric' })
const DIA = new Intl.DateTimeFormat('es-BO', { day: 'numeric' })
const MES = new Intl.DateTimeFormat('es-BO', { month: 'short' })
const DIA_MES = new Intl.DateTimeFormat('es-BO', { day: 'numeric', month: 'short' })
const HORA = new Intl.DateTimeFormat('es-BO', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })

const mismoDia = (a: Date, b: Date) => a.toDateString() === b.toDateString()

/** «9:00 – 12:00» si es en un día; «20 nov. – 22 nov.» si dura varios. */
function horario(evento: EventoPortada) {
  const inicio = new Date(evento.inicio)
  const fin = new Date(evento.fin)
  return mismoDia(inicio, fin) ? `${HORA.format(inicio)} – ${HORA.format(fin)}` : `${DIA_MES.format(inicio)} – ${DIA_MES.format(fin)}`
}

function ImagenNoticia({ noticia, className }: { noticia: NoticiaPortada; className: string }) {
  if (noticia.imagen) {
    return <img src={noticia.imagen} alt="" loading="lazy" className={`${className} object-cover`} />
  }
  // Sin foto: un bloque del tema con el ícono de noticias, para que la tarjeta no quede vacía
  return (
    <div aria-hidden="true" className={`${className} flex items-center justify-center bg-fondo text-texto-suave`}>
      <IconoNoticias width={36} height={36} />
    </div>
  )
}

function Encabezado({ id, etiqueta, titulo, destino, textoDestino }: { id: string; etiqueta: string; titulo: string; destino: string; textoDestino: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <div>
        <p className="text-sm font-bold uppercase tracking-widest text-acento">{etiqueta}</p>
        <h2 id={id} className="mt-2 text-3xl text-titulo">
          {titulo}
        </h2>
      </div>
      <Link to={destino} className="group inline-flex items-center gap-1.5 text-sm font-semibold text-acento hover:underline">
        {textoDestino} <IconoFlecha width={16} height={16} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  )
}

function Noticias({ noticias }: { noticias: NoticiaPortada[] }) {
  const [destacada, ...demas] = noticias

  return (
    <section aria-labelledby="titulo-noticias">
      <Encabezado id="titulo-noticias" etiqueta="Novedades" titulo="Noticias" destino="/noticias" textoDestino="Ver todas las noticias" />

      <div className={`grid gap-5 ${demas.length > 0 ? 'md:grid-cols-2' : ''}`}>
        {/* La más reciente, grande: foto arriba y resumen */}
        <Link
          to={destacada.ruta}
          className="group flex flex-col overflow-hidden rounded-tema border border-borde-tarjeta bg-tarjeta sombra-suave transition hover:-translate-y-1 hover:border-primario hover:sombra-elevada motion-reduce:hover:translate-y-0"
        >
          <ImagenNoticia noticia={destacada} className="aspect-[16/9] w-full" />
          <div className="flex flex-1 flex-col p-6">
            {destacada.fecha && (
              <time dateTime={destacada.fecha} className="text-sm text-texto-suave">
                {FECHA.format(new Date(destacada.fecha))}
              </time>
            )}
            <h3 className="mt-2 text-xl leading-snug text-titulo group-hover:text-acento">{destacada.titulo}</h3>
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-texto-suave">{destacada.resumen}</p>
          </div>
        </Link>

        {/* Las siguientes, compactas: foto al costado */}
        {demas.length > 0 && (
          <ul className="flex flex-col gap-5">
            {demas.map((noticia) => (
              <li key={noticia.id} className="flex-1">
                <Link
                  to={noticia.ruta}
                  className="group flex h-full overflow-hidden rounded-tema border border-borde-tarjeta bg-tarjeta sombra-suave transition hover:border-primario hover:sombra-elevada"
                >
                  <ImagenNoticia noticia={noticia} className="w-32 shrink-0 sm:w-40" />
                  <div className="min-w-0 flex-1 p-4 sm:p-5">
                    {noticia.fecha && (
                      <time dateTime={noticia.fecha} className="text-xs text-texto-suave">
                        {FECHA.format(new Date(noticia.fecha))}
                      </time>
                    )}
                    <h3 className="mt-1 line-clamp-2 font-semibold leading-snug text-titulo group-hover:text-acento">{noticia.titulo}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-texto-suave">{noticia.resumen}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function Eventos({ eventos }: { eventos: EventoPortada[] }) {
  return (
    <section aria-labelledby="titulo-eventos">
      <Encabezado id="titulo-eventos" etiqueta="Agenda" titulo="Próximos eventos" destino="/eventos" textoDestino="Ver todos los eventos" />

      <ul className="flex flex-col gap-4">
        {eventos.map((evento) => {
          const inicio = new Date(evento.inicio)
          return (
            <li key={evento.id}>
              <Link
                to={evento.ruta}
                className="group flex gap-4 rounded-tema border border-borde-tarjeta bg-tarjeta p-4 sombra-suave transition hover:border-primario hover:sombra-elevada"
              >
                {/* Fecha como en un calendario de pared: se lee de un vistazo */}
                <time dateTime={evento.inicio} className="flex w-16 shrink-0 flex-col items-center justify-center rounded-tema bg-primario py-2 text-sobre-primario">
                  <span className="font-titulos text-2xl font-extrabold leading-none">{DIA.format(inicio)}</span>
                  <span className="mt-1 text-xs font-semibold uppercase">{MES.format(inicio).replace('.', '')}</span>
                </time>
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-2 font-semibold leading-snug text-titulo group-hover:text-acento">{evento.titulo}</h3>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-texto-suave">
                    <IconoHorario width={15} height={15} aria-hidden="true" className="shrink-0" /> {horario(evento)}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-texto-suave">
                    <IconoUbicacion width={15} height={15} aria-hidden="true" className="shrink-0" />
                    <span className="truncate">{evento.lugar}</span>
                  </p>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/**
 * CU-01: noticias recientes y próximos eventos en la portada, justo después de la presentación,
 * como en los portales de otras facultades. Si solo hay una de las dos, ocupa todo el ancho; sin ninguna, no se muestra.
 */
export function NovedadesInicio({ noticias, eventos }: { noticias: NoticiaPortada[]; eventos: EventoPortada[] }) {
  if (noticias.length === 0 && eventos.length === 0) return null

  const ambas = noticias.length > 0 && eventos.length > 0

  return (
    <div className={`mt-14 grid gap-12 md:mt-20 ${ambas ? 'lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-10' : ''}`}>
      {noticias.length > 0 && <Noticias noticias={noticias} />}
      {eventos.length > 0 && <Eventos eventos={eventos} />}
    </div>
  )
}
