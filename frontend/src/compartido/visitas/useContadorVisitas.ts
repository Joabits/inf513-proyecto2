import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { cliente } from '@/compartido/api/cliente'

/** Registra una visita cada vez que cambia la página y devuelve su total (requisito 7). */
export function useContadorVisitas() {
  const { pathname } = useLocation()
  const [total, setTotal] = useState<number | null>(null)
  const ultima = useRef<string | null>(null)

  useEffect(() => {
    if (ultima.current === pathname) return // evita contar dos veces la misma navegación
    ultima.current = pathname
    setTotal(null)
    cliente
      .post<{ total: number }>('/visitas', { pagina: pathname })
      .then((r) => setTotal(r.data.total))
      .catch(() => setTotal(null))
  }, [pathname])

  return total
}
