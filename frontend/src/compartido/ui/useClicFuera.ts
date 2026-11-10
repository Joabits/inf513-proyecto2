import { useEffect, type RefObject } from 'react'

/** Cierra un panel desplegable al hacer clic fuera de él o al presionar Escape. */
export function useClicFuera(ref: RefObject<HTMLElement | null>, abierto: boolean, cerrar: () => void) {
  useEffect(() => {
    if (!abierto) return
    const alPresionar = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) cerrar()
    }
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrar()
    }
    document.addEventListener('mousedown', alPresionar)
    document.addEventListener('keydown', alTeclear)
    return () => {
      document.removeEventListener('mousedown', alPresionar)
      document.removeEventListener('keydown', alTeclear)
    }
  }, [ref, abierto, cerrar])
}
