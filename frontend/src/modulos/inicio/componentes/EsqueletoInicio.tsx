const BLOQUE = 'rounded-tema bg-superficie motion-safe:animate-pulse'

/** Conserva la forma de la portada mientras llega el contenido, para que la página no salte. */
export function EsqueletoInicio() {
  return (
    <div role="status" aria-label="Cargando la portada">
      <div className="grid items-center gap-10 py-4 md:py-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
        <div className="space-y-5">
          <div className={`h-4 w-48 ${BLOQUE}`} />
          <div className={`h-16 w-full max-w-lg ${BLOQUE}`} />
          <div className={`h-28 w-full max-w-xl ${BLOQUE}`} />
        </div>
        <div className={`h-72 ${BLOQUE}`} />
      </div>
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className={`h-36 ${BLOQUE}`} />
        ))}
      </div>
    </div>
  )
}
