import type { Hito } from '../tipos'

/** Hitos de la historia de la Carrera, en orden cronológico. */
export function LineaTiempo({ hitos }: { hitos: Hito[] }) {
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
