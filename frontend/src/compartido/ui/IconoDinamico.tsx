import type { LucideProps } from 'lucide-react'
import type { ComponenteIcono } from './Iconos'

/** Muestra un ícono que llega como dato (por ejemplo, el de una ruta del menú). */
export function IconoDinamico({ icono: Icono, ...props }: { icono: ComponenteIcono } & LucideProps) {
  return <Icono {...props} />
}
