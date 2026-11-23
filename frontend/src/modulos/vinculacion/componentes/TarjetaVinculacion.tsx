import type { Vinculacion } from '../tipos'

interface Props {
  vinculacion: Vinculacion
}

export function TarjetaVinculacion({ vinculacion }: Props) {
  return (
    <article className="flex flex-col overflow-hidden bg-fondo border border-borde rounded-tema shadow-sm hover:shadow-md transition-shadow">
      {vinculacion.imagen && (
        <div className="w-full h-48 overflow-hidden bg-marino-oscuro">
          <img
            src={vinculacion.imagen}
            alt={vinculacion.titulo}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}

      <div className="flex flex-col flex-1 p-5 justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="text-titulo text-xl font-bold leading-snug">
            {vinculacion.titulo}
          </h3>
          <p className="text-texto text-sm whitespace-pre-line leading-relaxed">
            {vinculacion.descripcion}
          </p>
        </div>

        <div className="pt-2 space-y-3">
          {vinculacion.enlace && (
            <a
              href={vinculacion.enlace}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 py-2 bg-primario text-white text-sm font-medium rounded-tema hover:opacity-90 transition-opacity"
            >
              Más información
            </a>
          )}

          {(vinculacion.creado_en || vinculacion.autor) && (
            <div className="text-xs text-acento border-t border-borde pt-2 flex items-center justify-between">
              {vinculacion.autor && <span>Por: {vinculacion.autor}</span>}
              {vinculacion.creado_en && <span>{vinculacion.creado_en}</span>}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
