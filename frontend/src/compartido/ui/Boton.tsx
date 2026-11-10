import type { ButtonHTMLAttributes } from 'react'

type Variante = 'primario' | 'secundario' | 'borde'

const ESTILOS: Record<Variante, string> = {
  primario: 'bg-primario text-sobre-primario hover:bg-primario-oscuro',
  secundario: 'bg-marino text-white hover:opacity-90',
  borde: 'border border-borde text-texto hover:border-acento hover:text-acento',
}

export function Boton({
  variante = 'primario',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante }) {
  return (
    <button
      {...props}
      className={`rounded-tema px-4 py-2 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${ESTILOS[variante]} ${className}`}
    />
  )
}
