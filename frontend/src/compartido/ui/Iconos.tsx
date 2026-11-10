import type { SVGProps } from 'react'

/** Íconos de línea simples (24x24), heredan el color del texto. */
function Icono({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export const IconoBuscar = (p: SVGProps<SVGSVGElement>) => (
  <Icono {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Icono>
)

export const IconoMenu = (p: SVGProps<SVGSVGElement>) => (
  <Icono {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Icono>
)

export const IconoCerrar = (p: SVGProps<SVGSVGElement>) => (
  <Icono {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icono>
)

export const IconoFlecha = (p: SVGProps<SVGSVGElement>) => (
  <Icono {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icono>
)

export const IconoAbajo = (p: SVGProps<SVGSVGElement>) => (
  <Icono {...p}>
    <path d="m6 9 6 6 6-6" />
  </Icono>
)

export const IconoUsuario = (p: SVGProps<SVGSVGElement>) => (
  <Icono {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </Icono>
)

/** Accesibilidad: círculo mitad lleno (contraste / visualización). */
export const IconoVisualizacion = (p: SVGProps<SVGSVGElement>) => (
  <Icono {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
  </Icono>
)
