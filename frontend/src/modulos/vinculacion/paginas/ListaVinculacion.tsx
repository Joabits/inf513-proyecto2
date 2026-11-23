import { TarjetaVinculacion } from '../componentes/TarjetaVinculacion'
import { useVinculaciones } from '../hooks/useVinculacion'

export function ListaVinculacion() {
  const { data: vinculaciones, isLoading, isError } = useVinculaciones()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-borde pb-5">
        <h1 className="text-3xl font-extrabold text-titulo tracking-tight">
          Convenios y Vinculación
        </h1>
        <p className="mt-2 text-base text-texto">
          Conoce los convenios institucionales, alianzas estratégicas y proyectos de cooperación activa con los que cuenta la carrera.
        </p>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="w-10 h-10 border-4 border-primario border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-texto">Cargando vinculaciones...</p>
        </div>
      )}

      {isError && (
        <div className="p-4 bg-fondo border border-borde rounded-tema text-center">
          <p className="text-red-500 text-sm">
            Ocurrió un error al cargar la información de convenios y vinculaciones. Intente nuevamente más tarde.
          </p>
        </div>
      )}

      {!isLoading && !isError && (!vinculaciones || vinculaciones.length === 0) && (
        <div className="text-center py-16 bg-fondo border border-borde rounded-tema p-8">
          <p className="text-base text-texto">
            No hay convenios o vinculaciones publicadas en este momento.
          </p>
        </div>
      )}

      {!isLoading && !isError && vinculaciones && vinculaciones.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vinculaciones.map((v) => (
            <TarjetaVinculacion key={v.id} vinculacion={v} />
          ))}
        </div>
      )}
    </div>
  )
}
