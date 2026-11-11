import type { Portada } from '../tipos'

/** Si todavía no hay fotografía, el mensaje ocupa todo el ancho. */
export function MensajeDirector({ portada }: { portada: Portada }) {
  return (
    <section
      aria-labelledby="mensaje-director"
      className="mt-14 grid gap-8 rounded-tema border border-borde bg-marino p-6 text-sobre-primario sm:p-10 md:mt-20 md:grid-cols-[minmax(0,16rem)_1fr] md:items-center lg:gap-14 lg:p-14"
    >
      {portada.director_foto && (
        <img
          src={portada.director_foto}
          alt={`Fotografía de ${portada.director_nombre}`}
          loading="lazy"
          className="aspect-[4/5] w-full max-w-64 rounded-tema object-cover"
        />
      )}

      <div className={portada.director_foto ? '' : 'md:col-span-2'}>
        <span className="mb-4 block h-1 w-12 rounded-full bg-primario" aria-hidden="true" />
        <h2 id="mensaje-director" className="text-sm font-semibold uppercase tracking-widest text-sobre-primario">
          Mensaje del Director
        </h2>
        <blockquote className="mt-5 max-w-2xl text-lg font-medium leading-relaxed sm:text-xl lg:text-2xl lg:leading-relaxed">
          {portada.director_mensaje}
        </blockquote>
        <p className="mt-6">
          <span className="block font-bold">{portada.director_nombre}</span>
          <span className="text-sm">{portada.director_cargo}</span>
        </p>
      </div>
    </section>
  )
}
