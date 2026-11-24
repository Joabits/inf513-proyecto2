import { ChipIcono } from './ChipIcono'
import { iconoPorTema } from './iconoPorTema'

/**
 * Mosaico de áreas con su ícono: se lee de un vistazo, en vez de una lista escondida en un párrafo.
 * En el celular el ícono va arriba del texto: al lado no dejaba lugar para palabras como «Operaciones».
 * Las columnas dependen del ancho del mosaico (no de la pantalla): así entra igual en una columna angosta, como la
 * de Información académica junto al perfil, que a lo ancho de la página. Cada recuadro mide al menos lo necesario
 * para que «Operaciones» o «Investigación» no se corten.
 */
export function MosaicoAreas({ areas, titulo }: { areas: string[]; titulo: string }) {
  return (
    <ul
      aria-label={titulo}
      className="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-3 sm:grid-cols-[repeat(auto-fill,minmax(12rem,1fr))]"
    >
      {areas.map((area) => (
        <li
          key={area}
          className="flex flex-col items-start gap-2 rounded-tema border border-borde-tarjeta bg-tarjeta p-3.5 sombra-suave sm:flex-row sm:items-center sm:gap-3 sm:p-4"
        >
          <ChipIcono icono={iconoPorTema(area)} tamano="md" />
          <span className="min-w-0 break-words text-sm font-semibold leading-snug text-titulo">{area}</span>
        </li>
      ))}
    </ul>
  )
}
