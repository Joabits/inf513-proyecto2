import { RUTA_BASE } from '@/compartido/api/cliente'
import type { Galeria } from '../tipos'

export interface TarjetaGaleriaProps {
  item: Galeria
  alHacerClic?: (item: Galeria) => void
  aspecto?: 'square' | 'video'
}

export function TarjetaGaleria({
  item,
  alHacerClic,
  aspecto = 'square',
}: TarjetaGaleriaProps) {
  const urlImagen =
    item.imagen.startsWith('http://') ||
    item.imagen.startsWith('https://') ||
    !RUTA_BASE
      ? item.imagen
      : `${RUTA_BASE}${item.imagen}`

  const claseAspecto = aspecto === 'video' ? 'aspect-video' : 'aspect-square'

  return (
    <article
      onClick={() => alHacerClic?.(item)}
      onKeyDown={(e) => {
        if (alHacerClic && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          alHacerClic(item)
        }
      }}
      tabIndex={alHacerClic ? 0 : undefined}
      role={alHacerClic ? 'button' : undefined}
      className={`group overflow-hidden rounded-tema border border-borde bg-fondo transition duration-200 ${
        alHacerClic
          ? 'cursor-pointer hover:border-acento focus:border-acento focus:outline-none'
          : ''
      }`}
    >
      <div className={`relative w-full overflow-hidden ${claseAspecto} bg-marino-oscuro/5`}>
        <img
          src={urlImagen}
          alt={item.titulo || 'Imagen de la galería'}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {!item.publicado && (
          <span className="absolute top-2 right-2 rounded-tema bg-marino-oscuro/80 px-2 py-0.5 text-xs font-semibold text-fondo">
            Borrador
          </span>
        )}
      </div>

      {(item.titulo || item.descripcion) && (
        <div className="p-3">
          {item.titulo && (
            <h3 className="line-clamp-1 font-semibold text-titulo group-hover:text-acento">
              {item.titulo}
            </h3>
          )}
          {item.descripcion && (
            <p className="mt-1 line-clamp-2 text-xs text-texto">
              {item.descripcion}
            </p>
          )}
        </div>
      )}
    </article>
  )
}
