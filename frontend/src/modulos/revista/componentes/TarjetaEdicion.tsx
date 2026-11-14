import { useId, useState } from 'react'
import { IconoDocumento, IconoExterno, IconoRevista } from '@/compartido/ui/Iconos'
import { urlArticuloPublico, urlEdicionPublica } from '../api'
import { formatoTamano } from '../formato'
import type { Edicion } from '../tipos'

const ENLACE = 'inline-flex items-center gap-1.5 text-sm font-semibold text-acento underline-offset-4 hover:underline'

/**
 * Una edición publicada: portada, datos, el PDF completo y, desplegables, sus artículos.
 * El id permite llegar desde el buscador: /revista-innovar#edicion-3.
 */
export function TarjetaEdicion({ edicion }: { edicion: Edicion }) {
  const [abierta, setAbierta] = useState(false)
  const idArticulos = useId()
  const hayArticulos = edicion.articulos.length > 0

  return (
    <article id={`edicion-${edicion.id}`} className="scroll-mt-28 rounded-tema border border-borde-tarjeta bg-tarjeta p-5 sombra-suave md:p-6">
      <div className="flex flex-col gap-5 sm:flex-row">
        {edicion.portada ? (
          <img src={edicion.portada} alt={`Portada de ${edicion.nombre}`} loading="lazy" className="h-40 w-28 shrink-0 rounded-tema object-cover sm:h-48 sm:w-36" />
        ) : (
          <span className="grid h-40 w-28 shrink-0 place-items-center rounded-tema bg-chip text-sobre-chip sm:h-48 sm:w-36" aria-hidden="true">
            <IconoRevista width={40} height={40} />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold uppercase tracking-widest text-acento">{edicion.nombre}</p>
          {edicion.titulo && <h3 className="mt-2 font-titulos text-2xl leading-tight text-titulo">{edicion.titulo}</h3>}
          {edicion.descripcion && <p className="mt-3 leading-relaxed text-texto">{edicion.descripcion}</p>}

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
            {edicion.archivo && (
              <a href={urlEdicionPublica(edicion.id)} target="_blank" rel="noopener" className={ENLACE}>
                <IconoDocumento width={16} height={16} aria-hidden="true" /> Leer la edición completa (PDF, {formatoTamano(edicion.archivo.tamano)})
                <IconoExterno width={12} height={12} aria-hidden="true" />
                <span className="sr-only">(se abre en otra pestaña)</span>
              </a>
            )}
            {hayArticulos && (
              <button type="button" aria-expanded={abierta} aria-controls={idArticulos} onClick={() => setAbierta(!abierta)} className={ENLACE}>
                {abierta ? 'Ocultar los artículos' : `Ver los ${edicion.articulos.length} ${edicion.articulos.length === 1 ? 'artículo' : 'artículos'}`}
              </button>
            )}
          </div>
        </div>
      </div>

      {hayArticulos && abierta && (
        <ol id={idArticulos} className="mt-6 divide-y divide-borde border-t border-borde">
          {edicion.articulos.map((articulo) => (
            <li key={articulo.id} className="py-4">
              <h4 className="font-cuerpo text-base font-bold leading-snug text-titulo">{articulo.titulo}</h4>
              <p className="mt-0.5 text-sm text-texto-suave">{articulo.autores}</p>
              {articulo.resumen && <p className="mt-2 text-sm leading-relaxed text-texto">{articulo.resumen}</p>}
              {articulo.archivo && (
                <a href={urlArticuloPublico(articulo.id)} target="_blank" rel="noopener" className={`${ENLACE} mt-2`}>
                  Leer el artículo (PDF) <IconoExterno width={12} height={12} aria-hidden="true" />
                  <span className="sr-only">(se abre en otra pestaña)</span>
                </a>
              )}
            </li>
          ))}
        </ol>
      )}
    </article>
  )
}
