import { createContext, useContext } from 'react'
import type { Modo, PreferenciasTema } from './tipos'

export interface ValorTema extends PreferenciasTema {
  modoActivo: Modo
  cambiar: (cambios: Partial<PreferenciasTema>) => void
}

export const TemaContexto = createContext<ValorTema | null>(null)

export function useTema(): ValorTema {
  const valor = useContext(TemaContexto)
  if (!valor) throw new Error('useTema debe usarse dentro de <TemaProveedor>')
  return valor
}
