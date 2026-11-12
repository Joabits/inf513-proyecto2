const BLOQUE = 'rounded-tema motion-safe:animate-pulse'

/** Conserva la forma de la portada mientras llega el contenido, para que la página no salte. */
export function EsqueletoInicio() {
  return (
    <div role="status" aria-label="Cargando la portada">
      <div className="-mt-8 grid items-center gap-10 pb-14 pt-10 md:-mt-12 md:pb-20 md:pt-16 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
        <div className="space-y-5">
          <div className={`h-8 w-56 bg-superficie ${BLOQUE}`} />
          <div className={`h-16 w-full max-w-lg bg-superficie ${BLOQUE}`} />
          <div className={`h-28 w-full max-w-xl bg-superficie ${BLOQUE}`} />
        </div>
        <div className={`h-72 bg-superficie ${BLOQUE}`} />
      </div>
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className={`h-48 bg-superficie ${BLOQUE}`} />
        ))}
      </div>
    </div>
  )
}
