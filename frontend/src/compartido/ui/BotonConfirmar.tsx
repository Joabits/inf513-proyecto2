import { useState, type ReactNode } from 'react'
import { Boton } from '@/compartido/ui/Boton'

/** Acción irreversible en dos pasos, sin ventanas emergentes del navegador. */
export function BotonConfirmar(props: { pregunta: string; confirmar: string; ocupado: boolean; alConfirmar: () => void; children: ReactNode }) {
  const { pregunta, confirmar, ocupado, alConfirmar, children } = props
  const [preguntando, setPreguntando] = useState(false)

  if (!preguntando) {
    return (
      <Boton type="button" variante="borde" onClick={() => setPreguntando(true)} className="flex items-center gap-2 text-sm">
        {children}
      </Boton>
    )
  }

  return (
    <div role="group" aria-label={pregunta} className="flex flex-wrap items-center gap-2 text-sm">
      <span className="font-semibold text-titulo">{pregunta}</span>
      <Boton type="button" disabled={ocupado} onClick={alConfirmar} className="text-sm">
        {ocupado ? 'Eliminando...' : confirmar}
      </Boton>
      <Boton type="button" variante="borde" onClick={() => setPreguntando(false)} className="text-sm">
        Cancelar
      </Boton>
    </div>
  )
}
