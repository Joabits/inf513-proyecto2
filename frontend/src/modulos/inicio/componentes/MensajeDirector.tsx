import { IconoCita } from '@/compartido/ui/Iconos'
import type { Portada } from '../tipos'

/** Franja gris con el mensaje. Si todavía no hay fotografía, el mensaje va centrado. */
export function MensajeDirector({ portada }: { portada: Portada }) {
  const conFoto = !!portada.director_foto

  return (
    <section aria-labelledby="mensaje-director" className="banda banda-seccion py-14 md:py-20">
      <div className={conFoto ? 'grid gap-8 md:grid-cols-[minmax(0,16rem)_1fr] md:items-center lg:gap-14' : 'mx-auto max-w-3xl text-center'}>
        {portada.director_foto && (
          <img
            src={portada.director_foto}
            alt={`Fotografía de ${portada.director_nombre}`}
            loading="lazy"
            className="aspect-[4/5] w-full max-w-64 rounded-tema object-cover sombra-elevada"
          />
        )}

        <figure>
          <IconoCita width={44} height={44} aria-hidden="true" className={`text-acento ${conFoto ? '' : 'mx-auto'}`} />
          <h2 id="mensaje-director" className="mt-4 text-sm font-bold uppercase tracking-widest text-acento">
            Mensaje del Director
          </h2>
          <blockquote className="mt-5 text-lg font-medium leading-relaxed text-titulo sm:text-xl lg:text-2xl lg:leading-relaxed">
            {portada.director_mensaje}
          </blockquote>
          <figcaption className="mt-7">
            <span className="block font-bold text-titulo">{portada.director_nombre}</span>
            <span className="text-sm text-texto-suave">{portada.director_cargo}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
