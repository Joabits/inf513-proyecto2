import { FilaRegistro } from './FilaRegistro'
import type { Registro } from '../tipos'

/** «mostrarIp»: en ingresos e intentos sin permiso importa desde dónde fue cada uno, así que la dirección va en su propia columna, junto a la persona. */
export function TablaRegistros({ registros, actualizando, mostrarIp = false }: { registros: Registro[]; actualizando: boolean; mostrarIp?: boolean }) {
  return (
    // overflow-x-auto (no hidden): en el celular la tabla se desliza en vez de cortarse por la derecha
    <div className={`mt-3 overflow-x-auto rounded-tema border border-borde-tarjeta bg-tarjeta sombra-suave transition-opacity ${actualizando ? 'opacity-60' : ''}`}>
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">Registros de actividad, del más reciente al más antiguo</caption>
        <thead>
          <tr className="text-xs uppercase tracking-wide text-texto-suave">
            {/* En el celular el «cuándo» va dentro de la actividad, arriba del texto: la columna sola ocupaba media pantalla */}
            <th scope="col" className="hidden border-l-4 border-transparent py-2.5 pl-4 pr-3 font-semibold md:table-cell">
              Cuándo
            </th>
            <th scope="col" className="hidden py-2.5 pr-4 font-semibold md:table-cell">
              Persona
            </th>
            {mostrarIp && (
              <th scope="col" className="hidden whitespace-nowrap py-2.5 pr-4 font-semibold md:table-cell">
                Dirección IP
              </th>
            )}
            <th scope="col" className="border-l-4 border-transparent py-2.5 pl-3 pr-2 font-semibold md:border-l-0 md:pl-0">
              Actividad
            </th>
            <th scope="col" className="w-3 md:w-4">
              <span className="sr-only">Detalle</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {registros.map((registro) => (
            <FilaRegistro key={registro.id} registro={registro} mostrarIp={mostrarIp} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
