import { FilaRegistro } from './FilaRegistro'
import type { Registro } from '../tipos'

/**
 * Cada registro muestra a la vista lo que pide la auditoría: fecha y hora, quién (nombre y correo), qué hizo, desde
 * qué dirección IP y con qué dispositivo. Lo que cambió (antes y después) se ve al abrir la fila.
 */
export function TablaRegistros({ registros, actualizando }: { registros: Registro[]; actualizando: boolean }) {
  return (
    // overflow-x-auto (no hidden): en el celular la tabla se desliza en vez de cortarse por la derecha
    <div className={`mt-3 overflow-x-auto rounded-tema border border-borde-tarjeta bg-tarjeta sombra-suave transition-opacity ${actualizando ? 'opacity-60' : ''}`}>
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">Registros de actividad, del más reciente al más antiguo</caption>
        <thead>
          <tr className="text-xs uppercase tracking-wide text-texto-suave">
            {/* En el celular la fecha, la persona, la IP y el dispositivo van dentro de la actividad: las columnas solas no entran */}
            <th scope="col" className="hidden whitespace-nowrap border-l-4 border-transparent py-2.5 pl-4 pr-3 font-semibold md:table-cell">
              Fecha y hora
            </th>
            <th scope="col" className="hidden py-2.5 pr-4 font-semibold md:table-cell">
              Persona
            </th>
            <th scope="col" className="border-l-4 border-transparent py-2.5 pl-3 pr-2 font-semibold md:border-l-0 md:pl-0">
              Actividad
            </th>
            <th scope="col" className="hidden whitespace-nowrap py-2.5 pr-4 font-semibold lg:table-cell">
              Dirección IP
            </th>
            <th scope="col" className="hidden py-2.5 pr-4 font-semibold xl:table-cell">
              Dispositivo
            </th>
            <th scope="col" className="w-3 md:w-4">
              <span className="sr-only">Detalle</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {registros.map((registro) => (
            <FilaRegistro key={registro.id} registro={registro} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
