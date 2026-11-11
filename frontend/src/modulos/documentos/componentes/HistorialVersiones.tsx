import { EstadoCarga, MensajeError } from '@/compartido/ui/EstadoCarga'
import { urlVersion } from '../api'
import { formatoFecha, formatoTamano, NOMBRE_TIPO } from '../formato'
import { useVersiones } from '../useDocumentos'

export function HistorialVersiones({ id }: { id: number }) {
  const { data, isPending, isError } = useVersiones(id, true)

  if (isPending) return <EstadoCarga texto="Cargando el historial..." />
  if (isError) return <MensajeError texto="No se pudo cargar el historial." />

  return (
    <ol className="space-y-3 text-sm">
      {data.map((version) => (
        <li key={version.id} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3">
          <span className="min-w-0">
            <span className="block truncate font-semibold text-titulo">{version.nombre_original}</span>
            <span className="text-texto-suave">
              Reemplazado el {formatoFecha(version.reemplazado)} · {NOMBRE_TIPO[version.tipo]} · {formatoTamano(version.tamano)}
              {version.subido_por && ` · Subido por ${version.subido_por}`}
            </span>
          </span>
          <a href={urlVersion(id, version.id)} target="_blank" rel="noopener" className="font-semibold text-titulo underline underline-offset-4 hover:text-acento">
            Abrir
          </a>
        </li>
      ))}
    </ol>
  )
}
