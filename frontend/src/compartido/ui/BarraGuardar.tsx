import { useEffect } from 'react'
import { Boton } from '@/compartido/ui/Boton'
import { IconoListo } from '@/compartido/ui/Iconos'

/**
 * Pie fijo de cada formulario del panel: estado de los cambios y botón Guardar.
 * Mientras haya cambios sin guardar, el navegador avisa antes de cerrar o recargar la pestaña.
 */
export function BarraGuardar(props: { sucio: boolean; guardando: boolean; guardado: boolean; error?: string }) {
  const { sucio, guardando, guardado, error } = props

  useEffect(() => {
    if (!sucio) return
    const avisar = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', avisar)
    return () => window.removeEventListener('beforeunload', avisar)
  }, [sucio])

  return (
    <div className="sticky bottom-0 -mx-5 -mb-5 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-b-tema border-t border-borde bg-fondo px-5 py-4 sm:-mx-6 sm:-mb-6 sm:px-6">
      <p role="status" className="text-sm">
        {error ? (
          <span className="font-semibold text-acento">{error}</span>
        ) : sucio ? (
          <span className="text-texto-suave">Hay cambios sin guardar.</span>
        ) : (
          guardado && (
            <span className="inline-flex items-center gap-1.5 font-semibold text-titulo">
              <IconoListo width={16} height={16} /> Cambios guardados
            </span>
          )
        )}
      </p>
      <Boton type="submit" disabled={!sucio || guardando}>
        {guardando ? 'Guardando...' : 'Guardar cambios'}
      </Boton>
    </div>
  )
}
