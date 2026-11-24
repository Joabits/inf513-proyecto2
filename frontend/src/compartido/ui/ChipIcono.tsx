import type { ComponenteIcono } from './Iconos'

/** Tamaño del ícono: ya no lleva cuadro de fondo, así que el ícono es un poco más grande que antes. */
const TAMANOS = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-9 w-9',
}

/**
 * Ícono destacado de una tarjeta o sección, sin fondo: solo el trazo, en el color de acento (rojo de día, gris claro
 * de noche, negro en alto contraste). Es decorativo.
 */
export function ChipIcono({
  icono: Icono,
  tamano = 'md',
  className = '',
}: {
  icono: ComponenteIcono
  tamano?: keyof typeof TAMANOS
  className?: string
}) {
  return (
    <span aria-hidden="true" className={`grid shrink-0 place-items-center text-acento [&>svg]:h-full [&>svg]:w-full ${TAMANOS[tamano]} ${className}`}>
      <Icono strokeWidth={1.75} />
    </span>
  )
}
