import { Outlet, ScrollRestoration } from 'react-router'
import { AvisoPanel } from './AvisoPanel'
import { BarraSuperior } from './BarraSuperior'
import { Cabecera } from './Cabecera'
import { Pie } from './Pie'

/**
 * Estructura común de todas las páginas: cabecera + contenido + pie.
 * overflow-x-clip: las franjas de lado a lado (utilidad banda) no deben crear barra horizontal.
 */
export function Plantilla() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-tema focus:bg-primario focus:px-4 focus:py-2 focus:text-sobre-primario"
      >
        Saltar al contenido
      </a>
      <AvisoPanel />
      <BarraSuperior />
      <Cabecera />
      {/* La franja del título de cada página sube con -mt-8 / -mt-12 hasta la cabecera */}
      <main id="contenido" className="contenedor flex-1 pt-8 pb-16 md:pt-12 md:pb-20">
        <Outlet />
      </main>
      <Pie />
      <ScrollRestoration />
    </div>
  )
}
