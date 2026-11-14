import type { ReactNode } from 'react'
import { IconoDocumento, IconoImagen, IconoSubirArchivo } from '@/compartido/ui/Iconos'
import { formatoTamano } from '../formato'
import type { ArchivoPdf } from '../tipos'

/**
 * Elegir un PDF o una imagen, con tres estados: sin archivo, archivo ya guardado y archivo recién elegido.
 * El formulario decide qué enviar (el nuevo, nada o «quitar»); aquí solo se muestra y se pide.
 */
export function CampoArchivo(props: {
  id: string
  etiqueta: string
  tipo: 'pdf' | 'imagen'
  accept: string
  ayuda: string
  /** Lo que ya tiene guardado el servidor */
  actual?: ArchivoPdf | { nombre: string; tamano?: number } | null
  /** Vista previa (imagen): la recién elegida o la guardada */
  vista?: string | null
  nuevo: File | null
  quitado: boolean
  error: string | null
  alElegir: (archivo: File | undefined) => void
  alQuitar: () => void
  opcional?: boolean
  children?: ReactNode
}) {
  const { id, etiqueta, tipo, accept, ayuda, actual, vista, nuevo, quitado, error, alElegir, alQuitar, opcional = true } = props
  const Icono = tipo === 'pdf' ? IconoDocumento : IconoImagen
  const nombre = nuevo?.name ?? (!quitado ? actual?.nombre : undefined)
  const tamano = nuevo?.size ?? (!quitado ? actual?.tamano : undefined)
  const hayArchivo = !!nombre || (tipo === 'imagen' && !!vista && !quitado)

  return (
    <div>
      <p className="mb-1 text-sm font-semibold text-titulo">
        {etiqueta}
        {opcional && <span className="ml-2 font-normal text-texto-suave">Opcional</span>}
      </p>

      <div className="flex flex-wrap items-center gap-4 rounded-tema border border-dashed border-borde p-4">
        {tipo === 'imagen' && vista && !quitado ? (
          <img src={vista} alt="" className="h-20 w-16 shrink-0 rounded-tema object-cover" />
        ) : (
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-superficie text-titulo" aria-hidden="true">
            <Icono width={22} height={22} />
          </span>
        )}

        <div className="min-w-0 flex-1 text-sm">
          {hayArchivo ? (
            <>
              <span className="block truncate font-semibold text-titulo">{nombre ?? 'Portada actual'}</span>
              <span className="text-texto-suave">
                {tamano !== undefined && `${formatoTamano(tamano)} · `}
                {nuevo ? 'Listo para guardar' : 'Guardado'}
              </span>
            </>
          ) : (
            <span className="text-texto-suave">{quitado ? 'Se quitará al guardar.' : 'Ningún archivo.'}</span>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-tema border border-borde px-3 py-2 text-sm font-semibold text-titulo transition-colors focus-within:border-titulo hover:border-acento hover:text-acento">
            <IconoSubirArchivo width={16} height={16} aria-hidden="true" />
            {hayArchivo ? 'Reemplazar' : 'Elegir'}
            <input
              id={id}
              type="file"
              accept={accept}
              className="sr-only"
              aria-describedby={`${id}-info`}
              onChange={(e) => {
                alElegir(e.target.files?.[0])
                e.target.value = ''
              }}
            />
          </label>
          {hayArchivo && (
            <button type="button" onClick={alQuitar} className="text-sm font-semibold text-acento underline-offset-4 hover:underline">
              Quitar
            </button>
          )}
        </div>
      </div>

      <p id={`${id}-info`} className="mt-1 text-sm">
        {error ? (
          <span role="alert" className="font-semibold text-acento">
            {error}
          </span>
        ) : (
          <span className="text-texto-suave">{ayuda}</span>
        )}
      </p>
    </div>
  )
}
