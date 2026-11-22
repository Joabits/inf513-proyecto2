import type { Evento } from '../tipos'

interface TarjetaEventoProps {
  evento: Evento
}

export function TarjetaEvento({ evento }: TarjetaEventoProps) {
  return (
    <article className="flex flex-col justify-between rounded-tema border border-borde bg-fondo p-6 shadow-sm transition hover:shadow-md">
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-titulo">{evento.titulo}</h3>
        <p className="whitespace-pre-line text-sm text-texto">{evento.descripcion}</p>

        <div className="space-y-1 text-xs text-texto">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-titulo">Inicio:</span>
            <span>{evento.fecha_inicio}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-titulo">Fin:</span>
            <span>{evento.fecha_fin}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-titulo">Lugar:</span>
            <span>{evento.lugar}</span>
          </div>
          {evento.autor && (
            <div className="flex items-center gap-2 text-xs opacity-75">
              <span>Organizado por: {evento.autor}</span>
            </div>
          )}
        </div>
      </div>

      {evento.enlace && (
        <div className="mt-4 pt-3 border-t border-borde">
          <a
            href={evento.enlace}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-tema bg-primario px-4 py-2 text-center text-sm font-semibold text-sobre-primario transition hover:bg-marino"
          >
            Más información
          </a>
        </div>
      )}
    </article>
  )
}
