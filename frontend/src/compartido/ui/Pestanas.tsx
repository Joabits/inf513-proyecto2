import type { KeyboardEvent } from 'react'

export interface Pestana {
  id: string
  titulo: string
}

/**
 * Pestañas accesibles: las flechas cambian de pestaña. Cada panel debe tener
 * id={`panel-${id}`}, role="tabpanel" y aria-labelledby={`pestana-${id}`}.
 */
export function Pestanas(props: { etiqueta: string; opciones: Pestana[]; activa: string; alCambiar: (id: string) => void }) {
  const { etiqueta, opciones, activa, alCambiar } = props

  function moverConTeclado(e: KeyboardEvent) {
    const paso = { ArrowRight: 1, ArrowLeft: -1 }[e.key]
    if (!paso) return

    e.preventDefault()
    const posicion = opciones.findIndex((o) => o.id === activa)
    const siguiente = opciones[(posicion + paso + opciones.length) % opciones.length].id
    alCambiar(siguiente)
    document.getElementById(`pestana-${siguiente}`)?.focus()
  }

  return (
    <div role="tablist" aria-label={etiqueta} onKeyDown={moverConTeclado} className="flex gap-1 overflow-x-auto overflow-y-hidden border-b border-borde">
      {opciones.map((o) => (
        <button
          key={o.id}
          id={`pestana-${o.id}`}
          type="button"
          role="tab"
          aria-selected={o.id === activa}
          aria-controls={`panel-${o.id}`}
          tabIndex={o.id === activa ? 0 : -1}
          onClick={() => alCambiar(o.id)}
          className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            o.id === activa ? 'border-primario text-titulo' : 'border-transparent text-texto-suave hover:text-titulo'
          }`}
        >
          {o.titulo}
        </button>
      ))}
    </div>
  )
}
