import type { ReactNode } from 'react'

export const CLASE_ENTRADA =
  'mt-1 w-full rounded-tema border border-borde bg-fondo px-3 py-2 text-texto focus:border-titulo focus:outline-none aria-invalid:border-primario'

/**
 * Etiqueta, ayuda y error de un campo de formulario:
 *   <Campo id="titulo" etiqueta="Título" error={errors.titulo?.message}>
 *     <input id="titulo" aria-describedby="titulo-info" aria-invalid={!!errors.titulo} className={CLASE_ENTRADA} {...register('titulo')} />
 *   </Campo>
 */
export function Campo(props: {
  id: string
  etiqueta: string
  ayuda?: string
  error?: string
  opcional?: boolean
  usados?: number
  limite?: number
  children: ReactNode
}) {
  const { id, etiqueta, ayuda, error, opcional, usados, limite, children } = props

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-titulo">
          {etiqueta}
          {opcional && <span className="ml-2 font-normal text-texto-suave">Opcional</span>}
        </label>
        {limite !== undefined && (
          <span className="text-xs text-texto-suave" aria-hidden="true">
            {usados ?? 0}/{limite}
          </span>
        )}
      </div>
      {children}
      <div id={`${id}-info`} className="mt-1 text-sm">
        {error ? <p className="font-semibold text-acento">{error}</p> : ayuda && <p className="text-texto-suave">{ayuda}</p>}
      </div>
    </div>
  )
}
