import { IconoBajar, IconoCalendario } from '@/compartido/ui/Iconos'
import { Tarjeta } from '@/compartido/ui/Tarjeta'
import { descargarDocumento } from '../api/documentos'
import { formatoFecha, formatoTamano, nombreFormato } from '../formato'
import type { Documento } from '../tipos/index'

/**
 * Documento público (CU-05). El formato se ve antes de hacer clic: un formulario en Word se completa,
 * un reglamento en PDF solo se lee. El botón es de borde para que la cuadrícula no se llene de bloques rojos:
 * el rojo aparece al pasar el cursor, como acento. Para un lector de pantalla, cada botón dice qué descarga.
 */
export function TarjetaDocumento({ documento }: { documento: Documento }) {
  const formato = nombreFormato(documento.tipo)
  const peso = typeof documento.tamano === 'number' ? formatoTamano(documento.tamano) : documento.tamano
  const categoria = typeof documento.categoria === 'object' && documento.categoria !== null ? documento.categoria.nombre : documento.categoria
  const fecha = documento.creado ?? documento.creado_en

  return (
    <Tarjeta className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        {categoria && (
          <span className="inline-flex items-center rounded-tema border border-borde bg-superficie px-2.5 py-0.5 text-xs font-semibold text-titulo">
            {categoria}
          </span>
        )}
        {formato && (
          <span className="shrink-0 rounded-tema bg-chip px-2 py-0.5 text-xs font-bold tracking-wide text-sobre-chip" title={`Archivo ${formato}`}>
            {formato}
          </span>
        )}
      </div>

      <h3 className="mt-3 line-clamp-2 break-words text-lg font-bold leading-snug text-titulo">{documento.titulo}</h3>

      {documento.descripcion && <p className="mt-2 line-clamp-3 break-words text-sm text-texto-suave">{documento.descripcion}</p>}

      {/* mt-auto: fecha, peso y botón quedan al fondo y alineados en toda la fila, sea cual sea el largo del título */}
      <div className="mt-auto pt-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-t border-borde pt-4 text-xs text-texto-suave">
          {fecha && (
            <span className="flex items-center gap-1.5">
              <IconoCalendario width={14} height={14} aria-hidden="true" />
              {formatoFecha(fecha)}
            </span>
          )}
          {peso && <span className="font-medium">{peso}</span>}
        </div>

        <a
          href={descargarDocumento(documento.id)}
          download
          className="inline-flex w-full items-center justify-center gap-2 rounded-tema border border-borde px-4 py-2.5 text-sm font-semibold text-titulo transition-colors duration-200 hover:border-primario hover:bg-primario hover:text-sobre-primario focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario"
        >
          <IconoBajar width={16} height={16} aria-hidden="true" />
          {formato ? `Descargar ${formato}` : 'Descargar'}
          <span className="sr-only">: {documento.titulo}</span>
        </a>
      </div>
    </Tarjeta>
  )
}
