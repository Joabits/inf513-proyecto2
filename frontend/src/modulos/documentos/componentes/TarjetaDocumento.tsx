import type { Documento } from '../tipos/index'
import { descargarDocumento } from '../api/documentos'
import { formatoTamano } from '../formato'
import { IconoBajar, IconoCalendario, IconoDocumento } from '@/compartido/ui/Iconos'
import { Tarjeta } from '@/compartido/ui/Tarjeta'

interface Props {
  documento: Documento
}

function formatearFecha(fechaStr?: string): string {
  if (!fechaStr) return ''
  try {
    const fecha = new Date(fechaStr)
    if (!isNaN(fecha.getTime())) {
      return new Intl.DateTimeFormat('es-BO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(fecha)
    }
  } catch {
    // Si no es parseable como Date, se devuelve la cadena tal como viene
  }
  return fechaStr
}

export function TarjetaDocumento({ documento }: Props) {
  const urlDescarga = descargarDocumento(documento.id)
  const peso =
    documento.tamaño ||
    (typeof documento.tamano === 'number'
      ? formatoTamano(documento.tamano)
      : documento.tamano)

  const nombreCategoria =
    typeof documento.categoria === 'object' && documento.categoria !== null
      ? documento.categoria.nombre
      : (documento.categoria || 'General')

  const fechaStr = documento.creado_en || documento.creado

  return (
    <Tarjeta className="flex flex-col justify-between transition hover:sombra-elevada">
      <div>
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex items-center rounded-tema border border-borde bg-superficie px-2.5 py-0.5 text-xs font-semibold text-marino">
            {nombreCategoria}
          </span>
          <div className="text-texto-suave" aria-hidden="true">
            <IconoDocumento />
          </div>
        </div>

        <h3 className="mt-3 text-lg font-bold text-titulo line-clamp-2">
          {documento.titulo}
        </h3>

        {documento.descripcion && (
          <p className="mt-2 text-sm text-texto-suave line-clamp-3">
            {documento.descripcion}
          </p>
        )}
      </div>

      <div className="mt-6 border-t border-borde pt-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-texto-suave">
          {fechaStr && (
            <span className="flex items-center gap-1.5">
              <IconoCalendario />
              <span>{formatearFecha(fechaStr)}</span>
            </span>
          )}
          {peso && (
            <span className="font-medium text-texto-suave">
              {peso}
            </span>
          )}
        </div>

        <a
          href={urlDescarga}
          download
          className="inline-flex w-full items-center justify-center gap-2 rounded-tema bg-primario px-4 py-2.5 text-sm font-semibold text-sobre-primario transition hover:bg-marino focus:outline-none"
        >
          <IconoBajar />
          <span>Descargar</span>
        </a>
      </div>
    </Tarjeta>
  )
}
