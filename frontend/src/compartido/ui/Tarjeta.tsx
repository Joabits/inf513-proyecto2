import type { HTMLAttributes } from 'react'

export function Tarjeta({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`rounded-tema border border-borde bg-superficie p-5 ${className}`} />
}
