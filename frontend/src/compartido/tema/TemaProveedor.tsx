import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { TemaContexto } from './contexto'
import { modoSegunHora, type Modo, type PreferenciasTema } from './tipos'

const CLAVE = 'cae-preferencias-tema'
const PREDETERMINADAS: PreferenciasTema = { tema: 'adultos', modo: 'auto', tamano: 1, contraste: 'normal' }

function leerPreferencias(): PreferenciasTema {
  try {
    const guardado = localStorage.getItem(CLAVE)
    return guardado ? { ...PREDETERMINADAS, ...JSON.parse(guardado) } : PREDETERMINADAS
  } catch {
    return PREDETERMINADAS
  }
}

export function TemaProveedor({ children }: { children: ReactNode }) {
  const [preferencias, setPreferencias] = useState(leerPreferencias)
  const [modoPorHora, setModoPorHora] = useState(() => modoSegunHora())

  // Revisa la hora cada minuto para cambiar solo de día a noche
  useEffect(() => {
    const id = setInterval(() => setModoPorHora(modoSegunHora()), 60_000)
    return () => clearInterval(id)
  }, [])

  const modoActivo: Modo = preferencias.modo === 'auto' ? modoPorHora : preferencias.modo

  // Aplica todo como atributos en <html>; index.css hace el resto
  useEffect(() => {
    const html = document.documentElement
    html.dataset.tema = preferencias.tema
    html.dataset.modo = modoActivo
    html.dataset.contraste = preferencias.contraste
    html.style.setProperty('--tam-usuario', String(preferencias.tamano))
    try {
      localStorage.setItem(CLAVE, JSON.stringify(preferencias))
    } catch {
      /* navegación privada: se usa sin guardar */
    }
  }, [preferencias, modoActivo])

  const valor = useMemo(
    () => ({
      ...preferencias,
      modoActivo,
      cambiar: (cambios: Partial<PreferenciasTema>) => setPreferencias((p) => ({ ...p, ...cambios })),
    }),
    [preferencias, modoActivo],
  )

  return <TemaContexto value={valor}>{children}</TemaContexto>
}
