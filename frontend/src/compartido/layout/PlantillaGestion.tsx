import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, Outlet, ScrollRestoration } from 'react-router'
import { MarcaCarrera } from '@/compartido/marca/LogoCarrera'
import { useMenu } from '@/compartido/menu/useMenu'
import { useSesion } from '@/compartido/sesion/useSesion'
import { PanelAccesibilidad } from '@/compartido/tema/PanelAccesibilidad'
import { EstadoCarga } from '@/compartido/ui/EstadoCarga'
import { IconoCerrar, IconoExterno, IconoMenu, IconoMostrarMenu, IconoOcultarMenu } from '@/compartido/ui/Iconos'
import { BarraGestion, CabeceraMenu } from './BarraGestion'
import { MenuPerfil } from './MenuPerfil'
import { ContextoPlantilla } from './contextoPlantilla'
import { PieSimple } from './Pie'

const CLAVE_MENU_OCULTO = 'cae-menu-panel-oculto'

function leerMenuOculto() {
  try {
    return localStorage.getItem(CLAVE_MENU_OCULTO) === '1'
  } catch {
    return false
  }
}

/** Vista del personal: barra lateral fija en PC y desplegable en celular y tablet. */
export function PlantillaGestion() {
  const { data: usuario, isLoading } = useSesion()
  const { data: menu } = useMenu()
  const [abierto, setAbierto] = useState(false)
  // En PC el menú lateral se puede ocultar; la preferencia queda guardada en este navegador
  const [menuOculto, setMenuOculto] = useState(leerMenuOculto)
  const botonOcultar = useRef<HTMLButtonElement>(null)
  const botonMostrar = useRef<HTMLButtonElement>(null)

  /** El foco pasa al botón que queda a la vista: así se puede volver con el teclado. */
  function cambiarMenu(ocultar: boolean) {
    setMenuOculto(ocultar)
    requestAnimationFrame(() => (ocultar ? botonMostrar : botonOcultar).current?.focus())
  }

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_MENU_OCULTO, menuOculto ? '1' : '0')
    } catch {
      /* navegación privada: se usa sin guardar */
    }
  }, [menuOculto])

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

      {/* El aside reserva el ancho y el menú va fijo en la pantalla: no se mueve al bajar la página */}
      <aside id="menu-lateral" className={`hidden w-72 shrink-0 ${menuOculto ? '' : 'lg:block'}`}>
        <div className="fixed inset-y-0 left-0 w-72">
          <BarraGestion
            grupos={grupos}
            accion={
              <button
                ref={botonOcultar}
                type="button"
                aria-controls="menu-lateral"
                aria-expanded="true"
                aria-label="Ocultar el menú lateral"
                title="Ocultar el menú lateral"
                onClick={() => cambiarMenu(true)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-titulo hover:bg-superficie"
              >
                <IconoOcultarMenu aria-hidden="true" />
              </button>
            }
          />
        </div>
      </aside>

      {abierto && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menú de gestión">
          <button type="button" aria-label="Cerrar menú" onClick={() => setAbierto(false)} className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-xs">
            <BarraGestion
              grupos={grupos}
              alNavegar={() => setAbierto(false)}
              accion={
                <button type="button" aria-label="Cerrar menú" onClick={() => setAbierto(false)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-titulo hover:bg-superficie">
                  <IconoCerrar />
                </button>
              }
            />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className={`sticky top-0 z-30 flex h-16 items-center gap-3 bg-fondo px-4 lg:h-18 lg:pr-8 ${menuOculto ? 'lg:pl-0' : 'lg:pl-8'}`}>
          <button
            type="button"
            aria-label="Abrir menú de gestión"
            onClick={() => setAbierto(true)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-titulo hover:bg-superficie lg:hidden"
          >
            <IconoMenu />
          </button>
          {/* PC con el menú oculto: la misma fila de arriba del menú, así el logo y el botón no se mueven.
              El borde transparente iguala el borde derecho de 1px del menú lateral. */}
          {menuOculto && (
            <div className="hidden w-72 shrink-0 border-r border-transparent lg:block">
              <CabeceraMenu
                accion={
                  <button
                    ref={botonMostrar}
                    type="button"
                    aria-controls="menu-lateral"
                    aria-expanded="false"
                    aria-label="Mostrar el menú lateral"
                    title="Mostrar el menú lateral"
                    onClick={() => cambiarMenu(false)}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-titulo hover:bg-superficie"
                  >
                    <IconoMostrarMenu aria-hidden="true" />
                  </button>
                }
              />
            </div>
          )}
          {/* Celular y tablet: el logo va en la barra (el menú es desplegable) */}
          <Link to="/gestion" className="lg:hidden" aria-label="Ir al panel de gestión">
            <MarcaCarrera />
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/"
              target="_blank"
              className="hidden items-center gap-1.5 rounded-full border border-borde px-3 py-1.5 text-sm font-semibold text-titulo transition-colors hover:border-titulo sm:inline-flex"
            >
              <IconoExterno width={15} height={15} aria-hidden="true" /> Ver el portal
            </Link>
            <PanelAccesibilidad />
            <MenuPerfil usuario={usuario} />
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
