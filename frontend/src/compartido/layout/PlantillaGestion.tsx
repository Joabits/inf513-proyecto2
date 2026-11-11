import { useEffect, useState } from 'react'
import { Link, Navigate, Outlet, ScrollRestoration } from 'react-router'
import { LogoFcee } from '@/compartido/marca/LogoFcee'
import { useMenu } from '@/compartido/menu/useMenu'
import { useSesion } from '@/compartido/sesion/useSesion'
import { useTema } from '@/compartido/tema/contexto'
import { PanelAccesibilidad } from '@/compartido/tema/PanelAccesibilidad'
import { EstadoCarga } from '@/compartido/ui/EstadoCarga'
import { IconoCerrar, IconoExterno, IconoMenu } from '@/compartido/ui/Iconos'
import { BarraGestion } from './BarraGestion'
import { ContextoPlantilla } from './contextoPlantilla'
import { PieSimple } from './Pie'

/** Vista del personal: barra lateral fija en PC y desplegable en celular y tablet. */
export function PlantillaGestion() {
  const { data: usuario, isLoading } = useSesion()
  const { data: menu } = useMenu()
  const { modoActivo } = useTema()
  const [abierto, setAbierto] = useState(false)

  // Bloquea el scroll de la página y cierra con Escape mientras el menú está abierto
  useEffect(() => {
    if (!abierto) return
    const cerrar = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false)
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', cerrar)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', cerrar)
    }
  }, [abierto])

  if (isLoading) return <EstadoCarga />
  if (!usuario) return <Navigate to="/gestion/ingresar" replace />

  const grupos = menu?.gestion ?? []

  return (
    <div className="flex min-h-screen">
      <meta name="robots" content="noindex, nofollow" />
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-tema focus:bg-primario focus:px-4 focus:py-2 focus:text-sobre-primario"
      >
        Saltar al contenido
      </a>

      <aside className="hidden w-72 shrink-0 lg:block">
        <div className="sticky top-0 h-screen">
          <BarraGestion usuario={usuario} grupos={grupos} />
        </div>
      </aside>

      {abierto && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menú de gestión">
          <button type="button" aria-label="Cerrar menú" onClick={() => setAbierto(false)} className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-xs">
            <BarraGestion usuario={usuario} grupos={grupos} alNavegar={() => setAbierto(false)} />
            <button
              type="button"
              aria-label="Cerrar menú"
              onClick={() => setAbierto(false)}
              className="absolute right-3 top-5 grid h-10 w-10 place-items-center rounded-full text-sobre-primario hover:bg-marino"
            >
              <IconoCerrar />
            </button>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-borde bg-fondo px-4 lg:justify-end lg:px-8">
          <button
            type="button"
            aria-label="Abrir menú de gestión"
            onClick={() => setAbierto(true)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-titulo hover:bg-superficie lg:hidden"
          >
            <IconoMenu />
          </button>
          <Link to="/gestion" className="lg:hidden" aria-label="Ir al panel de gestión">
            <LogoFcee version={modoActivo === 'oscuro' ? 'negativo' : 'positivo'} className="h-11" />
          </Link>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Link
              to="/"
              target="_blank"
              className="hidden items-center gap-1.5 rounded-full border border-borde px-3 py-1.5 text-sm font-semibold text-titulo transition-colors hover:border-titulo sm:inline-flex"
            >
              <IconoExterno width={15} height={15} aria-hidden="true" /> Ver el portal
            </Link>
            <PanelAccesibilidad />
          </div>
        </header>

        <main id="contenido" className="flex-1 px-4 py-8 md:py-10 lg:px-8">
          <ContextoPlantilla.Provider value="gestion">
            <Outlet />
          </ContextoPlantilla.Provider>
        </main>
        <PieSimple />
      </div>
      <ScrollRestoration />
    </div>
  )
}
