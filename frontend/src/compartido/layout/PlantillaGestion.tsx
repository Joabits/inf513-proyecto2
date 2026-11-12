import { useEffect, useState } from 'react'
import { Link, Navigate, Outlet, ScrollRestoration } from 'react-router'
import { MarcaCarrera } from '@/compartido/marca/LogoCarrera'
import { useMenu } from '@/compartido/menu/useMenu'
import { useSesion } from '@/compartido/sesion/useSesion'
import { PanelAccesibilidad } from '@/compartido/tema/PanelAccesibilidad'
import { EstadoCarga } from '@/compartido/ui/EstadoCarga'
import { IconoCerrar, IconoContraerMenu, IconoExpandirMenu, IconoExterno, IconoMenu } from '@/compartido/ui/Iconos'
import { ANCHO_MENU_COMPACTO, BarraGestion, CabeceraMenu, MenuGestion } from './BarraGestion'
import { MenuPerfil } from './MenuPerfil'
import { ContextoPlantilla } from './contextoPlantilla'
import { PieSimple } from './Pie'

const CLAVE_MENU_COMPACTO = 'cae-menu-panel-compacto'

function leerMenuCompacto() {
  try {
    return localStorage.getItem(CLAVE_MENU_COMPACTO) === '1'
  } catch {
    return false
  }
}

/**
 * Vista del personal. En PC: barra superior a todo el ancho (logo, botón del menú y cuenta) y debajo el menú
 * lateral fijo, que se puede contraer a solo íconos. En celular y tablet el menú es desplegable.
 */
export function PlantillaGestion() {
  const { data: usuario, isLoading } = useSesion()
  const { data: menu } = useMenu()
  const [abierto, setAbierto] = useState(false)
  // En PC el menú se puede dejar solo con íconos; la preferencia queda guardada en este navegador
  const [compacto, setCompacto] = useState(leerMenuCompacto)

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_MENU_COMPACTO, compacto ? '1' : '0')
    } catch {
      /* navegación privada: se usa sin guardar */
    }
  }, [compacto])

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
  const ancho = compacto ? ANCHO_MENU_COMPACTO : 'w-72'
  const textoBoton = compacto ? 'Expandir el menú lateral' : 'Contraer el menú lateral'

  return (
    <div className="flex min-h-screen flex-col">
      <meta name="robots" content="noindex, nofollow" />
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-tema focus:bg-primario focus:px-4 focus:py-2 focus:text-sobre-primario"
      >
        Saltar al contenido
      </a>

      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 bg-fondo px-4 lg:h-18 lg:pl-0 lg:pr-8">
        <button
          type="button"
          aria-label="Abrir menú de gestión"
          onClick={() => setAbierto(true)}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-titulo hover:bg-superficie lg:hidden"
        >
          <IconoMenu />
        </button>
        {/* Celular y tablet: el logo va en la barra (el menú es desplegable) */}
        <Link to="/gestion" className="lg:hidden" aria-label="Ir al panel de gestión">
          <MarcaCarrera />
        </Link>
        {/* PC: logo y botón del menú, con el ancho del menú completo. No se mueven al contraer el menú. */}
        <div className="hidden w-72 shrink-0 lg:block">
          <CabeceraMenu
            accion={
              <button
                type="button"
                aria-controls="menu-lateral"
                aria-expanded={!compacto}
                aria-label={textoBoton}
                title={textoBoton}
                onClick={() => setCompacto(!compacto)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-titulo hover:bg-superficie"
              >
                {compacto ? <IconoExpandirMenu aria-hidden="true" /> : <IconoContraerMenu aria-hidden="true" />}
              </button>
            }
          />
        </div>
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

      <div className="flex flex-1">
        {/* El aside reserva el ancho y el menú va fijo bajo la barra superior: no se mueve al bajar la página */}
        <aside id="menu-lateral" className={`hidden shrink-0 lg:block ${ancho}`}>
          <div className={`fixed bottom-0 left-0 top-18 flex flex-col border-r border-borde-tarjeta bg-fondo text-texto ${ancho}`}>
            <MenuGestion grupos={grupos} compacto={compacto} />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <main id="contenido" className="flex-1 px-4 py-8 md:py-10 lg:px-8">
            <ContextoPlantilla.Provider value="gestion">
              <Outlet />
            </ContextoPlantilla.Provider>
          </main>
          <PieSimple />
        </div>
      </div>

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
      <ScrollRestoration />
    </div>
  )
}
