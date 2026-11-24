import { Link } from 'react-router'
import { IconoFlecha } from '@/compartido/ui/Iconos'
import type { FotoPortada } from '../tipos'

/**
 * «Vida en la Carrera»: las cinco fotos más recientes de la galería (CU-06) en mosaico, una grande y cuatro chicas.
 * Cada foto lleva a la galería completa; el título aparece al pasar el cursor o al llegar con el teclado.
 */
export function GaleriaInicio({ fotos }: { fotos: FotoPortada[] }) {
  if (fotos.length === 0) return null

  return (
    <section aria-labelledby="titulo-galeria-inicio" className="mt-12 md:mt-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-acento">Galería</p>
          <h2 id="titulo-galeria-inicio" className="mt-2 text-3xl text-titulo md:text-4xl">
            Vida en la Carrera
          </h2>
        </div>
        <Link to="/galeria" className="inline-flex shrink-0 items-center gap-2 font-semibold text-acento underline-offset-4 hover:underline">
          Ver toda la galería <IconoFlecha width={18} height={18} aria-hidden="true" />
        </Link>
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-3 md:auto-rows-[12rem] md:grid-cols-4 md:gap-4 lg:auto-rows-[14rem]">
        {fotos.map((foto, i) => (
          <li key={foto.id} className={i === 0 ? 'col-span-2 aspect-[4/3] md:row-span-2 md:aspect-auto' : 'aspect-square md:aspect-auto'}>
            <Link
              to="/galeria"
              className="group relative block h-full overflow-hidden rounded-tema bg-superficie focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario"
            >
              <img
                src={foto.imagen}
                alt={foto.titulo ?? 'Foto de la galería de la Carrera'}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
              {foto.titulo && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 bg-marino-oscuro/75 px-3 py-2 text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  {foto.titulo}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
