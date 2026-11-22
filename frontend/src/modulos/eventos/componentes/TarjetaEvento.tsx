import { IconoExterno, IconoHorario, IconoUbicacion } from '@/compartido/ui/Iconos'
import type { Evento } from '../tipos'

const DIA = new Intl.DateTimeFormat('es-BO', { day: 'numeric' })
const MES = new Intl.DateTimeFormat('es-BO', { month: 'short' })
const DIA_MES = new Intl.DateTimeFormat('es-BO', { day: 'numeric', month: 'short', year: 'numeric' })
const HORA = new Intl.DateTimeFormat('es-BO', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })

/** «09:00 – 12:00» si es en un día; «20 nov. 2026 – 22 nov. 2026» si dura varios. */
function horario(inicio: Date, fin: Date) {
  return inicio.toDateString() === fin.toDateString()
    ? `${HORA.format(inicio)} – ${HORA.format(fin)}`
    : `${DIA_MES.format(inicio)} – ${DIA_MES.format(fin)}`
}

/**
 * Tarjeta pública de un evento: fecha como calendario (igual que en la portada), horario, lugar y descripción
 * completa, porque los eventos no tienen página propia. No muestra la cuenta que lo cargó: no es quien lo organiza.
 */
export function TarjetaEvento({ evento, realizado = false }: { evento: Evento; realizado?: boolean }) {
  const inicio = evento.fecha_inicio_iso ? new Date(evento.fecha_inicio_iso) : null
  const fin = evento.fecha_fin_iso ? new Date(evento.fecha_fin_iso) : null

  return (
    <article className="flex h-full flex-col rounded-tema border border-borde-tarjeta bg-tarjeta p-5 sombra-suave">
      <div className="flex gap-4">
        {inicio && (
          <time
            dateTime={evento.fecha_inicio_iso}
            className={`flex w-16 shrink-0 flex-col items-center justify-center rounded-tema py-2 ${realizado ? 'bg-superficie text-titulo' : 'bg-primario text-sobre-primario'}`}
          >
            <span className="font-titulos text-2xl font-extrabold leading-none">{DIA.format(inicio)}</span>
            <span className="mt-1 text-xs font-semibold uppercase">{MES.format(inicio).replace('.', '')}</span>
          </time>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="break-words font-semibold leading-snug text-titulo">{evento.titulo}</h3>
          {inicio && fin && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-texto-suave">
              <IconoHorario width={15} height={15} aria-hidden="true" className="shrink-0" /> {horario(inicio, fin)}
            </p>
          )}
          <p className="mt-1 flex items-start gap-1.5 text-sm text-texto-suave">
            <IconoUbicacion width={15} height={15} aria-hidden="true" className="mt-0.5 shrink-0" />
            <span className="break-words">{evento.lugar}</span>
          </p>
        </div>
      </div>

      <p className="mt-4 flex-1 whitespace-pre-line break-words text-sm leading-relaxed text-texto">{evento.descripcion}</p>

      {evento.enlace && !realizado && (
        <a
          href={evento.enlace}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-acento hover:underline"
        >
          Más información <IconoExterno width={14} height={14} aria-hidden="true" />
          <span className="sr-only">(se abre en otra pestaña)</span>
        </a>
      )}
    </article>
  )
}
