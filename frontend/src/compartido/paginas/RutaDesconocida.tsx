import { useLocation } from 'react-router'
import { useMenu } from '@/compartido/menu/useMenu'
import { EnConstruccion } from './EnConstruccion'
import { PaginaNoEncontrada } from './PaginaNoEncontrada'

/**
 * Ruta que ningún módulo atiende. Si el menú la ofrece, su módulo todavía no existe y se muestra
 * «en construcción»; si no, la dirección no existe.
 */
export function RutaDesconocida() {
  const { pathname } = useLocation()
  const { data: menu, isPending } = useMenu()

  // Mientras llega el menú no se decide, para no mostrar «no encontrada» en una opción del menú
  if (isPending) return null

  const enMenu = [...(menu?.publico ?? []), ...(menu?.gestion ?? [])]
    .flatMap((opcion) => [opcion, ...opcion.hijos])
    .some((opcion) => opcion.ruta === pathname)

  return enMenu ? <EnConstruccion /> : <PaginaNoEncontrada />
}
