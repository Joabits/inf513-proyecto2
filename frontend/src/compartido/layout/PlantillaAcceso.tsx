import { Link, Outlet, ScrollRestoration } from 'react-router'
import { LogoFcee } from '@/compartido/marca/LogoFcee'
import { useTema } from '@/compartido/tema/contexto'
import { PanelAccesibilidad } from '@/compartido/tema/PanelAccesibilidad'
import { Pie } from './Pie'

/** Pantalla de acceso del personal: sin el menú ni el buscador del portal público. */
export function PlantillaAcceso() {
  const { modoActivo } = useTema()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="contenedor flex h-16 items-center justify-between lg:h-18">
        <Link to="/" className="shrink-0" aria-label="Volver al portal">
          <LogoFcee version={modoActivo === 'oscuro' ? 'negativo' : 'positivo'} className="h-11 min-[375px]:h-12 lg:h-14" />
        </Link>
        <PanelAccesibilidad />
      </header>
      <main id="contenido" className="contenedor flex-1 py-8 md:py-12">
        <Outlet />
      </main>
      <Pie />
      <ScrollRestoration />
    </div>
  )
}
