import type { Documento } from '../tipos'
import { useCambiarPublicacion } from '../useDocumentos'

const ETIQUETA = 'rounded-full px-2.5 py-0.5 text-xs font-semibold'

/**
 * Estado del documento en el portal. Con permiso de edición es un interruptor que publica u oculta
 * al instante (se puede deshacer con otro clic); sin permiso, solo muestra el estado.
 */
export function EstadoPublicacion({ documento, editable }: { documento: Documento; editable: boolean }) {
  const cambiar = useCambiarPublicacion()
  const { publicado } = documento
  const texto = publicado ? 'Publicado' : 'Oculto'

  if (!editable) {
    return <span className={`${ETIQUETA} ${publicado ? 'bg-superficie text-titulo' : 'border border-borde text-texto-suave'}`}>{texto}</span>
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={publicado}
        aria-label={`Publicar «${documento.titulo}» en el portal`}
        disabled={cambiar.isPending}
        onClick={() => cambiar.mutate({ id: documento.id, publicado: !publicado })}
        className="group inline-flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 text-xs font-semibold transition-colors hover:bg-superficie disabled:opacity-60"
      >
        <span
          aria-hidden="true"
          className={`relative h-5 w-9 rounded-full border transition-colors ${publicado ? 'border-titulo bg-titulo' : 'border-borde bg-superficie'}`}
        >
          <span
            className={`absolute left-0.5 top-0.5 h-3.5 w-3.5 rounded-full transition-transform ${publicado ? 'translate-x-4 bg-fondo' : 'bg-texto-suave'}`}
          />
        </span>
        <span className={publicado ? 'text-titulo' : 'text-texto-suave'}>{cambiar.isPending ? 'Guardando...' : texto}</span>
      </button>
      {cambiar.isError && (
        <span role="alert" className="text-xs font-semibold text-acento">
          No se pudo cambiar.
        </span>
      )}
    </span>
  )
}
