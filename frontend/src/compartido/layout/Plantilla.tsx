import { Outlet, ScrollRestoration } from 'react-router'
import { AvisoPanel } from './AvisoPanel'
import { Cabecera } from './Cabecera'
import { Pie } from './Pie'

/** Estructura común de todas las páginas: cabecera + contenido + pie. */
export function Plantilla() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-tema focus:bg-primario focus:px-4 focus:py-2 focus:text-sobre-primario"
      >
        Saltar al contenido
      </a>
      <AvisoPanel />
      <Cabecera />
      <main id="contenido" className="contenedor flex-1 py-8 md:py-12">
        <Outlet />
      </main>
      <Pie />
      <ScrollRestoration />
    </div>
  )
}
