import { useSesion } from './useSesion'

/**
 * ¿El usuario actual tiene este permiso? Sirve para mostrar u ocultar botones:
 *   const puedeCrear = usePermiso('noticias.crear')
 *   {puedeCrear && <Boton>Nueva noticia</Boton>}
 * La API vuelve a verificarlo: ocultar un botón no es la única protección.
 */
export function usePermiso(permiso: string): boolean {
  const { data: usuario } = useSesion()
  return usuario?.permisos.includes(permiso) ?? false
}
