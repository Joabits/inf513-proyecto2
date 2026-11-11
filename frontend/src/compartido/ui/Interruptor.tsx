import type { InputHTMLAttributes } from 'react'

/**
 * Casilla con aspecto de interruptor, para opciones de sí o no. Sigue siendo un checkbox:
 * funciona con React Hook Form ({...register('campo')}), con teclado y con lectores de pantalla.
 */
export function Interruptor({
  etiqueta,
  ayuda,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { id: string; etiqueta: string; ayuda?: string }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center justify-between gap-6">
      <span>
        <span className="block text-sm font-semibold text-titulo">{etiqueta}</span>
        {ayuda && <span className="text-sm text-texto-suave">{ayuda}</span>}
      </span>
      <span className="relative inline-flex shrink-0">
        <input id={id} type="checkbox" role="switch" className="peer sr-only" {...props} />
        <span
          aria-hidden="true"
          className="h-6 w-11 rounded-full border border-borde bg-superficie transition-colors peer-checked:border-titulo peer-checked:bg-titulo peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-titulo"
        />
        <span
          aria-hidden="true"
          className="absolute left-1 top-1 h-4 w-4 rounded-full bg-texto-suave transition-transform peer-checked:translate-x-5 peer-checked:bg-fondo"
        />
      </span>
    </label>
  )
}
