import { Outlet, ScrollRestoration } from 'react-router'
import { Cabecera } from './Cabecera'
import { Pie } from './Pie'

/** Estructura común de todas las páginas: cabecera + contenido + pie. */
export function Plantilla() {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-fondo focus:p-2">
        Saltar al contenido
      </a>
      <Cabecera />
      <main id="contenido" className="mx-auto w-full max-w-7xl flex-1 px-4 py-10">
        <Outlet />
      </main>
      <Pie />
      <ScrollRestoration />
    </div>
  )
}
