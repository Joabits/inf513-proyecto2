import { useId, useState } from 'react'

const LARGO_MINIMO = 320

/** Separa un texto en párrafos por líneas en blanco. */
const parrafosDe = (texto: string) =>
  texto
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

/**
 * Texto largo que se muestra corto: el primer párrafo (o las primeras líneas si es uno solo) y un botón
 * «Leer más» que despliega el resto. Un texto corto se muestra entero, sin botón.
 */
export function TextoPlegable({ texto, className = '', masTexto = 'Leer más', menosTexto = 'Leer menos' }: {
  texto: string
  className?: string
  masTexto?: string
  menosTexto?: string
}) {
  const [abierto, setAbierto] = useState(false)
  const id = useId()
  const parrafos = parrafosDe(texto)
  const plegable = texto.length > LARGO_MINIMO
  const unSoloParrafo = parrafos.length === 1
  const visibles = !plegable || abierto || unSoloParrafo ? parrafos : parrafos.slice(0, 1)

  return (
    <div className={className}>
      <div id={id} className="space-y-4 leading-relaxed text-texto">
        {visibles.map((parrafo, i) => (
          // Texto fijo que no se reordena: la posición sirve como clave
          <p key={i} className={plegable && unSoloParrafo && !abierto ? 'line-clamp-3' : ''}>
            {parrafo}
          </p>
        ))}
      </div>
      {plegable && (
        <button
          type="button"
          aria-expanded={abierto}
          aria-controls={id}
          onClick={() => setAbierto(!abierto)}
          className="mt-3 text-sm font-semibold text-acento underline-offset-4 hover:underline"
        >
          {abierto ? menosTexto : masTexto}
        </button>
      )}
    </div>
  )
}
