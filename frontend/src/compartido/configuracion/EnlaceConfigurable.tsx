import type { ReactNode } from 'react'
import { Link } from 'react-router'

/** Las páginas del portal (/documentos) navegan sin recargar; los sitios externos se abren en otra pestaña. */
export function EnlaceConfigurable({ url, className, children }: { url: string; className?: string; children: ReactNode }) {
  if (url.startsWith('/')) {
    return (
      <Link to={url} className={className}>
        {children}
      </Link>
    )
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  )
}
