import { useEventos } from '../hooks/useEventos'
import { TarjetaEvento } from '../componentes/TarjetaEvento'

export function ListaEventos() {
  const { data: eventos, isLoading, isError } = useEventos(true)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-titulo">Eventos Académicos</h1>
        <p className="mt-2 text-texto">Conferencias, talleres, seminarios y actividades programadas por la carrera.</p>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-texto">Cargando eventos...</div>
      ) : isError ? (
        <div className="rounded-tema border border-borde bg-fondo p-6 text-center text-red-500">
          Ocurrió un error al cargar los eventos académicos.
        </div>
      ) : !eventos || eventos.length === 0 ? (
        <div className="rounded-tema border border-borde bg-fondo p-12 text-center text-texto">
          No hay eventos académicos disponibles en este momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {eventos.map((evento) => (
            <TarjetaEvento key={evento.id} evento={evento} />
          ))}
        </div>
      )}
    </div>
  )
}
