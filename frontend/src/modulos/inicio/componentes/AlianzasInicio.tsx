import { Link } from 'react-router'
import { IconoFlecha } from '@/compartido/ui/Iconos'
import type { AlianzaPortada } from '../tipos'

/**
 * «Nuestras alianzas»: los logos de los convenios publicados en Vinculación (CU-20), sobre la franja gris.
 * Cada logo va en un recuadro blanco también de noche: los logos son imágenes con fondo blanco y en un recuadro
 * azul se verían como una mancha.
 */
export function AlianzasInicio({ alianzas }: { alianzas: AlianzaPortada[] }) {
  if (alianzas.length === 0) return null

  return (
    <section aria-labelledby="titulo-alianzas" className="franja-gris mt-12 py-14 md:mt-20 md:py-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-acento">Vinculación</p>
          <h2 id="titulo-alianzas" className="mt-2 text-3xl text-titulo md:text-4xl">
            Nuestras alianzas
          </h2>
          <p className="mt-3 max-w-2xl text-texto-suave md:text-lg">Convenios y programas con universidades e instituciones de Bolivia y del exterior.</p>
        </div>
        <Link to="/vinculacion" className="inline-flex shrink-0 items-center gap-2 font-semibold text-acento underline-offset-4 hover:underline">
          Ver convenios <IconoFlecha width={18} height={18} aria-hidden="true" />
        </Link>
      </div>

      <ul className="mt-10 flex flex-wrap justify-center gap-4">
        {alianzas.map((alianza) => (
          <li
            key={alianza.id}
            title={alianza.titulo}
            className="flex h-28 w-[calc(50%-0.5rem)] items-center justify-center rounded-tema bg-white p-4 sombra-suave sm:w-40 lg:w-36"
          >
            <img src={alianza.imagen} alt={alianza.titulo} loading="lazy" className="max-h-full max-w-full object-contain" />
          </li>
        ))}
      </ul>
    </section>
  )
}
