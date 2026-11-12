import type { ComponenteIcono } from './Iconos'

const TAMANOS = {
  sm: 'h-9 w-9 [&>svg]:h-[18px] [&>svg]:w-[18px]',
  md: 'h-11 w-11 [&>svg]:h-[22px] [&>svg]:w-[22px]',
  lg: 'h-14 w-14 [&>svg]:h-7 [&>svg]:w-7',
}

/** Ícono destacado dentro de un cuadro de color (azul de día, rojo de noche). Es decorativo. */
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
    <span aria-hidden="true" className={`grid shrink-0 place-items-center rounded-tema bg-chip text-sobre-chip ${TAMANOS[tamano]} ${className}`}>
      <Icono strokeWidth={1.75} />
    </span>
  )
}
