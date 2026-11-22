import type { Galeria } from '../tipos'
import { urlImagen } from '../urlImagen'

/**
 * Foto de la galería pública (CU-06). Es un botón de verdad (no un <article> con role="button"): se activa con
 * Enter y Espacio sin código extra y muestra el foco de teclado. Al activarse abre el visor.
 */
export function TarjetaGaleria({ item, alAbrir }: { item: Galeria; alAbrir: (item: Galeria) => void }) {
  return (
    <button
      type="button"
      onClick={() => alAbrir(item)}
      className="group block w-full overflow-hidden rounded-tema border border-borde-tarjeta bg-tarjeta text-left sombra-suave transition duration-200 ease-out hover:-translate-y-0.5 hover:sombra-elevada focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <img src={urlImagen(item.imagen)} alt={item.titulo || 'Fotografía de la galería'} loading="lazy" className="aspect-square w-full bg-fondo object-cover" />

      {(item.titulo || item.descripcion) && (
        <span className="block p-3">
          {item.titulo && <span className="line-clamp-1 font-semibold text-titulo transition-colors duration-200 group-hover:text-acento">{item.titulo}</span>}
          {item.descripcion && <span className="mt-1 line-clamp-2 text-xs text-texto-suave">{item.descripcion}</span>}
        </span>
      )}
    </button>
  )
}
