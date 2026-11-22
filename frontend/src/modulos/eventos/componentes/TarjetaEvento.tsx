import { IconoExterno, IconoHorario, IconoUbicacion } from '@/compartido/ui/Iconos'
import type { Evento } from '../tipos'

const DIA = new Intl.DateTimeFormat('es-BO', { day: 'numeric' })
const MES = new Intl.DateTimeFormat('es-BO', { month: 'short' })
const FECHA_LARGA = new Intl.DateTimeFormat('es-BO', { weekday: 'long', day: 'numeric', month: 'long' })
const DIA_MES = new Intl.DateTimeFormat('es-BO', { day: 'numeric', month: 'short', year: 'numeric' })
const HORA = new Intl.DateTimeFormat('es-BO', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })

const mayuscula = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1)

/** «Sábado 28 de noviembre · 09:00 – 12:00»; si dura varios días: «20 nov. 2026 – 22 nov. 2026». */
function cuando(inicio: Date, fin: Date) {
  if (inicio.toDateString() === fin.toDateString()) {
    return `${mayuscula(FECHA_LARGA.format(inicio))} · ${HORA.format(inicio)} – ${HORA.format(fin)}`
  }
  return `${DIA_MES.format(inicio)} – ${DIA_MES.format(fin)}`
}

/**
 * Un evento de la agenda pública (CU-01): una fila con la fecha como calendario a la izquierda y, al lado, el
 * título, cuándo y dónde es, y la descripción completa (los eventos no tienen página propia).
 * `enCurso` y `realizado` cambian solo el énfasis: lo que ya pasó se ve más tenue y sin el rojo.
 */
export function TarjetaEvento({ evento, enCurso = false, realizado = false }: { evento: Evento; enCurso?: boolean; realizado?: boolean }) {
  const inicio = evento.fecha_inicio_iso ? new Date(evento.fecha_inicio_iso) : null
  const fin = evento.fecha_fin_iso ? new Date(evento.fecha_fin_iso) : null

  return (
    <article className="flex gap-4 rounded-tema border border-borde-tarjeta bg-tarjeta p-4 sombra-suave sm:gap-6 sm:p-5">
      {inicio && (
        <time
          dateTime={evento.fecha_inicio_iso}
          className={`flex h-20 w-16 shrink-0 flex-col items-center justify-center rounded-tema sm:w-20 ${
            realizado ? 'bg-superficie text-titulo' : 'bg-primario text-sobre-primario'
          }`}
        >
          <span className="font-titulos text-3xl font-extrabold leading-none">{DIA.format(inicio)}</span>
          <span className="mt-1 text-xs font-semibold uppercase">{MES.format(inicio).replace('.', '')}</span>
        </time>
      )}

      <div className="min-w-0 flex-1">
        {enCurso && <span className="mb-1.5 inline-block rounded-full bg-chip px-2 py-0.5 text-xs font-semibold text-sobre-chip">En curso</span>}
        <h3 className="break-words text-lg font-semibold leading-snug text-titulo">{evento.titulo}</h3>

        {inicio && fin && (
          <p className="mt-2 flex items-start gap-1.5 text-sm text-texto">
            <IconoHorario width={15} height={15} aria-hidden="true" className="mt-0.5 shrink-0" />
            <span>{cuando(inicio, fin)}</span>
          </p>
        )}
        <p className="mt-1 flex items-start gap-1.5 text-sm text-texto">
          <IconoUbicacion width={15} height={15} aria-hidden="true" className="mt-0.5 shrink-0" />
          <span className="break-words">{evento.lugar}</span>
        </p>

        <p className="mt-3 whitespace-pre-line break-words text-sm leading-relaxed text-texto-suave">{evento.descripcion}</p>

        {evento.enlace && !realizado && (
          <a
            href={evento.enlace}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-acento hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario"
          >
            Más información <IconoExterno width={14} height={14} aria-hidden="true" />
            <span className="sr-only">(se abre en otra pestaña)</span>
          </a>
        )}
      </div>
    </article>
  )
}
