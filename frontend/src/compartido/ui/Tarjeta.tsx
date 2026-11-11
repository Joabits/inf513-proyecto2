import type { HTMLAttributes } from 'react'

export function Tarjeta({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`rounded-tema border border-borde-tarjeta bg-tarjeta p-5 sombra-suave ${className}`} />
}
