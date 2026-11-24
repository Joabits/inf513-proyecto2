import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { TarjetaVinculacion } from '../componentes/TarjetaVinculacion'
import { useVinculaciones } from '../hooks/useVinculacion'

export function ListaVinculacion() {
  const { data: vinculaciones, isLoading, isError } = useVinculaciones()

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* El mismo encabezado que el resto del portal: ruta de navegación, título y foto de la sección */}
      <TituloPagina
        titulo="Convenios y vinculación"
        subtitulo="Convenios institucionales, alianzas estratégicas y proyectos de cooperación de la Carrera."
      />

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="w-10 h-10 border-4 border-primario border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-texto">Cargando vinculaciones...</p>
        </div>
      )}

      {isError && (
        <div role="alert" className="rounded-tema border border-primario/30 bg-primario/10 p-3 text-center text-sm font-semibold text-acento">
          Ocurrió un error al cargar la información de convenios y vinculaciones. Intente nuevamente más tarde.
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
