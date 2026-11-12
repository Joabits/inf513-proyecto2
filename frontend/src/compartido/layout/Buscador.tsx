import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { IconoBuscar } from '@/compartido/ui/Iconos'

/**
 * Búsqueda del encabezado (req. 9). Lleva a /buscar?q=...
 * La página de resultados la implementa el módulo de búsqueda (CU-07).
 */
export function Buscador({
  id,
  alBuscar,
  autoFocus = false,
  placeholder = 'Buscar en el portal...',
}: {
  id: string
  alBuscar?: () => void
  autoFocus?: boolean
  placeholder?: string
}) {
  const [texto, setTexto] = useState('')
  const navegar = useNavigate()

  function enviar(e: FormEvent) {
    e.preventDefault()
    const q = texto.trim()
    if (!q) return
    navegar(`/buscar?q=${encodeURIComponent(q)}`)
    alBuscar?.()
  }

  return (
    <form onSubmit={enviar} role="search" className="relative w-full">
      <label htmlFor={id} className="sr-only">
        Buscar en el portal
      </label>
      <input
        id={id}
        type="search"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="h-10 w-full rounded-full border border-borde bg-fondo pl-4 pr-11 text-sm text-texto placeholder:text-texto-suave/70 focus:border-titulo focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Buscar"
        className="absolute right-1 top-1 grid h-8 w-8 place-items-center rounded-full bg-primario text-sobre-primario hover:bg-marino"
      >
        <IconoBuscar width={16} height={16} />
      </button>
    </form>
  )
}
