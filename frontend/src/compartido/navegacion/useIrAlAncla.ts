import { useEffect } from 'react'
import { useLocation } from 'react-router'

/**
 * Lleva a la sección que indica la dirección (/revista-innovar#edicion-3) cuando la página ya tiene sus datos.
 *
 * React Router busca el ancla al cambiar de página, pero en las páginas que cargan su contenido desde la API ese
 * elemento todavía no existe en ese momento: la página se quedaba arriba. Aquí se espera a que el contenido esté
 * listo. El elemento de destino debe tener scroll-mt-* para no quedar tapado por la cabecera fija.
 *
 * @param listo true cuando el contenido de la página ya se dibujó (por ejemplo, !!data)
 */
export function useIrAlAncla(listo: boolean) {
  const { hash } = useLocation()

  useEffect(() => {
    if (!listo || !hash) return
    document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ block: 'start' })
  }, [listo, hash])
}
