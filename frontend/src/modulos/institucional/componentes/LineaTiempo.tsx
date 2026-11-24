import type { Hito } from '../tipos'

/**
 * Hitos de la historia de la Carrera, en orden cronológico.
 * horizontal: en pantallas grandes los años van en fila sobre una línea (en el celular, siempre en columna).
 */
export function LineaTiempo({ hitos, horizontal = false }: { hitos: Hito[]; horizontal?: boolean }) {
  if (!horizontal) {
    return (
      <ol className="relative space-y-7 border-l-2 border-borde pl-7">
        {hitos.map((hito) => (
          <li key={`${hito.anio}-${hito.titulo}`} className="relative">
            <span className="absolute -left-[2.3rem] top-0.5 h-4 w-4 rounded-full border-4 border-tarjeta bg-primario ring-2 ring-primario" aria-hidden="true" />
            <p className="inline-block rounded-tema bg-chip px-2.5 py-0.5 font-titulos text-sm font-extrabold text-sobre-chip">{hito.anio}</p>
            <h3 className="mt-2 font-cuerpo text-base font-bold text-titulo">{hito.titulo}</h3>
            {hito.descripcion && <p className="mt-1 text-sm leading-relaxed text-texto-suave">{hito.descripcion}</p>}
          </li>
        ))}
      </ol>
    )
  }

  return (
    // Va sobre la franja gris de La Carrera: la línea usa el color de títulos al 20 % (el de bordes es igual al de
    // la franja en modo noche) y el aro del punto es del color de la franja
    <ol
      className="relative grid gap-7 border-l-2 border-titulo/20 pl-7 lg:grid-flow-col lg:auto-cols-fr lg:gap-6 lg:border-l-0 lg:border-t-2 lg:pl-0 lg:pt-8"
    >
      {hitos.map((hito) => (
        <li key={`${hito.anio}-${hito.titulo}`} className="relative">
          {/* El punto se apoya en la línea: a la izquierda en el celular, arriba en pantallas grandes */}
          <span
            aria-hidden="true"
            className="absolute -left-[2.3rem] top-1 h-4 w-4 rounded-full border-4 border-superficie bg-primario ring-2 ring-primario lg:-top-[2.6rem] lg:left-0"
          />
          <p className="font-titulos text-3xl font-extrabold leading-none text-titulo">{hito.anio}</p>
          <h3 className="mt-3 font-cuerpo text-base font-bold text-titulo">{hito.titulo}</h3>
          {hito.descripcion && <p className="mt-1.5 text-sm leading-relaxed text-texto-suave">{hito.descripcion}</p>}
        </li>
      ))}
    </ol>
  )
}
