import type { AnchorHTMLAttributes } from 'react'
import { Link } from 'react-router'

/** Enlace administrable: las rutas internas navegan sin recargar y las externas abren otra pestaña. */
export function EnlaceInicio({ destino, ...props }: { destino: string } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return destino.startsWith('/') ? <Link to={destino} {...props} /> : <a href={destino} target="_blank" rel="noreferrer" {...props} />
}
