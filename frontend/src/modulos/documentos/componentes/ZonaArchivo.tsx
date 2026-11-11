import { useState } from 'react'
import { IconoListo, IconoSubirArchivo } from '@/compartido/ui/Iconos'
import { EXTENSIONES, MAXIMO_MB } from '../documentos.esquema'
import { formatoTamano } from '../formato'
import type { TipoDocumento } from '../tipos'
import { EtiquetaTipo } from './EtiquetaTipo'

/**
 * Área para arrastrar o elegir el archivo. Cuando ya hay uno elegido, se reemplaza por una ficha
 * con su nombre y tamaño, para confirmar que es el correcto antes de subirlo.
 */
export function ZonaArchivo(props: {
  id: string
  archivo: File | null
  error: string | null
  reemplazando?: string
  alElegir: (archivo: File | undefined) => void
  alQuitar: () => void
}) {
  const { id, archivo, error, reemplazando, alElegir, alQuitar } = props
  const [encima, setEncima] = useState(false)

  if (archivo) {
    const tipo = archivo.name.split('.').pop()?.toLowerCase() as TipoDocumento
    return (
      <div>
        <div className="flex items-center gap-4 rounded-tema border border-borde-tarjeta bg-tarjeta p-4 sombra-suave">
          <EtiquetaTipo tipo={tipo} />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold text-titulo">{archivo.name}</span>
            <span className="text-sm text-texto-suave">{formatoTamano(archivo.size)} · Archivo seleccionado</span>
          </span>
          <IconoListo className="shrink-0 text-titulo" aria-hidden="true" />
        </div>
        <button type="button" onClick={alQuitar} className="mt-2 text-sm font-semibold text-acento underline-offset-4 hover:underline">
          Quitar archivo
        </button>
      </div>
    )
  }

  return (
    <div>
      <label
        htmlFor={id}
        onDragOver={(e) => {
          e.preventDefault()
          setEncima(true)
        }}
        onDragLeave={() => setEncima(false)}
        onDrop={(e) => {
          e.preventDefault()
          setEncima(false)
          alElegir(e.dataTransfer.files[0])
        }}
        className={`flex cursor-pointer flex-col items-center rounded-tema border-2 border-dashed px-6 py-8 text-center transition-colors focus-within:border-titulo hover:border-titulo ${
          encima ? 'border-titulo bg-superficie' : error ? 'border-primario' : 'border-borde'
        }`}
      >
        <span className="grid h-12 w-12 place-items-center rounded-full bg-superficie text-titulo">
          <IconoSubirArchivo />
        </span>
        <span className="mt-3 font-semibold text-titulo">
          {reemplazando ? 'Arrastre aquí el archivo nuevo o selecciónelo' : 'Arrastre el documento aquí o selecciónelo'}
        </span>
        <span className="mt-1 text-sm text-texto-suave">PDF, Word (.docx) o Excel (.xlsx) · hasta {MAXIMO_MB} MB</span>
        {reemplazando && <span className="mt-2 text-sm text-texto-suave">El actual, «{reemplazando}», se guardará en el historial.</span>}
        <input
          id={id}
          type="file"
          accept={EXTENSIONES.join(',')}
          className="sr-only"
          aria-describedby={`${id}-info`}
          onChange={(e) => {
            alElegir(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      </label>
      <p id={`${id}-info`} role="alert" className="mt-1 text-sm font-semibold text-acento empty:hidden">
        {error}
      </p>
    </div>
  )
}
