import type { Edicion } from '../tipos'
import { useCambiarPublicacion } from '../useRevista'

const ETIQUETA = 'rounded-full px-2.5 py-0.5 text-xs font-semibold'

/**
 * Estado de la edición en el portal. Con permiso de edición es un interruptor que publica u oculta
 * al instante (se puede deshacer con otro clic); sin permiso, solo muestra el estado.
 */
export function EstadoEdicion({ edicion, editable }: { edicion: Edicion; editable: boolean }) {
  const cambiar = useCambiarPublicacion()
  const { publicada } = edicion
  const texto = publicada ? 'Publicada' : 'Borrador'

  if (!editable) {
    return <span className={`${ETIQUETA} ${publicada ? 'bg-superficie text-titulo' : 'border border-borde text-texto-suave'}`}>{texto}</span>
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={publicada}
        aria-label={`Publicar ${edicion.nombre} en el portal`}
        disabled={cambiar.isPending}
        onClick={() => cambiar.mutate({ id: edicion.id, publicada: !publicada })}
        className="inline-flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 text-xs font-semibold transition-colors hover:bg-superficie disabled:opacity-60"
      >
        <span aria-hidden="true" className={`relative h-5 w-9 rounded-full border transition-colors ${publicada ? 'border-titulo bg-titulo' : 'border-borde bg-superficie'}`}>
          <span className={`absolute left-0.5 top-0.5 h-3.5 w-3.5 rounded-full transition-transform ${publicada ? 'translate-x-4 bg-fondo' : 'bg-texto-suave'}`} />
        </span>
        <span className={publicada ? 'text-titulo' : 'text-texto-suave'}>{cambiar.isPending ? 'Guardando...' : texto}</span>
      </button>
      {cambiar.isError && (
        <span role="alert" className="text-xs font-semibold text-acento">
          No se pudo cambiar.
        </span>
      )}
    </span>
  )
}
