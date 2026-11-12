import { useState } from 'react'
import { mensajeDeError } from '@/compartido/api/errores'
import { Boton } from '@/compartido/ui/Boton'
import { CLASE_ENTRADA } from '@/compartido/ui/Campo'
import { esquemaCategoria } from '../documentos.esquema'
import type { Categoria } from '../tipos'
import { useCrearCategoria } from '../useDocumentos'

/**
 * Agrega una categoría sin salir del formulario. No es un <form> propio porque vive dentro del
 * formulario del documento; Enter la crea en lugar de enviar el documento.
 */
export function NuevaCategoria({ id, alCrear, alCancelar }: { id: string; alCrear: (categoria: Categoria) => void; alCancelar: () => void }) {
  const crear = useCrearCategoria()
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState<string | null>(null)

  function agregar() {
    const revisado = esquemaCategoria.safeParse({ nombre })
    if (!revisado.success) {
      setError(revisado.error.issues[0].message)
      return
    }
    crear.mutate(revisado.data.nombre, { onSuccess: alCrear, onError: (e) => setError(mensajeDeError(e)) })
  }

  return (
    <div className="mt-2 rounded-tema border border-borde bg-superficie p-3">
      <label htmlFor={id} className="text-sm font-semibold text-titulo">
        Nombre de la categoría nueva
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id={id}
          value={nombre}
          autoFocus
          maxLength={60}
          aria-describedby={`${id}-info`}
          aria-invalid={!!error}
          className={CLASE_ENTRADA}
          onChange={(e) => {
            setNombre(e.target.value)
            setError(null)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              agregar()
            }
            if (e.key === 'Escape') alCancelar()
          }}
        />
        <div className="flex shrink-0 gap-2 sm:mt-1">
          <Boton type="button" onClick={agregar} disabled={crear.isPending} className="text-sm">
            {crear.isPending ? 'Agregando...' : 'Agregar'}
          </Boton>
          <Boton type="button" variante="borde" onClick={alCancelar} className="text-sm">
            Cancelar
          </Boton>
        </div>
      </div>
      <p id={`${id}-info`} className="mt-1 text-sm">
        {error ? <span className="font-semibold text-acento">{error}</span> : <span className="text-texto-suave">Revise antes la lista: no se permiten categorías repetidas.</span>}
      </p>
    </div>
  )
}
