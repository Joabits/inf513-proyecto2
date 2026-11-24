import { IconoCita } from '@/compartido/ui/Iconos'
import type { Portada } from '../tipos'

/** Mensaje sobre el fondo de la página. Si todavía no hay fotografía, va centrado. */
export function MensajeDirector({ portada }: { portada: Portada }) {
  const conFoto = !!portada.director_foto

  return (
    <section aria-labelledby="mensaje-director" className="py-8 md:py-12">
      <div className={conFoto ? 'grid gap-6 md:grid-cols-[minmax(0,16rem)_1fr] md:items-center md:gap-8 lg:gap-14' : 'mx-auto max-w-3xl text-center'}>
        {portada.director_foto && (
          // En el celular la foto va chica, para que el mensaje se vea sin bajar tanto
          <img
            src={portada.director_foto}
            alt={`Fotografía de ${portada.director_nombre}`}
            loading="lazy"
            className="aspect-[4/5] w-36 rounded-tema object-cover sombra-elevada sm:w-48 md:w-full md:max-w-64"
          />
        )}

        <figure>
          <IconoCita aria-hidden="true" className={`h-9 w-9 text-acento md:h-11 md:w-11 ${conFoto ? '' : 'mx-auto'}`} />
          <h2 id="mensaje-director" className="mt-3 text-sm font-bold uppercase tracking-widest text-acento md:mt-4">
            Mensaje del Director
          </h2>
          <blockquote className="mt-4 text-base font-medium leading-relaxed text-titulo sm:text-lg md:mt-5 md:text-xl lg:text-2xl lg:leading-relaxed">
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
