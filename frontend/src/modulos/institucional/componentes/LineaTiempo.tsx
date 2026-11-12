import type { Hito } from '../tipos'

/** Hitos de la historia de la Carrera, en orden cronológico. */
export function LineaTiempo({ hitos }: { hitos: Hito[] }) {
  return (
    <ol className="relative space-y-8 border-l-2 border-borde pl-8">
      {hitos.map((hito) => (
        <li key={`${hito.anio}-${hito.titulo}`} className="relative">
          <span className="absolute -left-[2.6rem] top-1 h-4 w-4 rounded-full border-4 border-fondo bg-primario" aria-hidden="true" />
          <p className="font-titulos text-2xl font-extrabold text-acento">{hito.anio}</p>
          <h3 className="mt-1 font-cuerpo text-base font-bold text-titulo">{hito.titulo}</h3>
          {hito.descripcion && <p className="mt-1 text-sm leading-relaxed text-texto-suave">{hito.descripcion}</p>}
        </li>
      ))}
    </ol>
  )
}
