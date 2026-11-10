import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { LogoFcee } from '@/compartido/marca/LogoFcee'
import { useMenu } from '@/compartido/menu/useMenu'
import { useSesion } from '@/compartido/sesion/useSesion'
import { useTema } from '@/compartido/tema/contexto'
import { PanelAccesibilidad } from '@/compartido/tema/PanelAccesibilidad'
import { IconoBuscar, IconoCerrar, IconoMenu, IconoUsuario } from '@/compartido/ui/Iconos'
import { Buscador } from './Buscador'
import { MenuEscritorio } from './MenuEscritorio'
import { MenuMovil } from './MenuMovil'
import { MenuUsuario } from './MenuUsuario'

const botonIcono = 'grid h-10 w-10 shrink-0 place-items-center rounded-full text-titulo transition-colors hover:bg-superficie'

/** Ancho mínimo de pantalla para intentar mostrar el menú en la fila (laptops y PC). */
const ANCHO_ESCRITORIO = 1024

/**
 * Cabecera de UNA sola fila (64 px en celular, 72 px en PC), sin líneas divisorias:
 *   logo · menú (si cabe) · buscador · visualización · ingresar/gestión · ☰ (si el menú no cabe)
 *
 * La cabecera MIDE si el menú cabe en la fila. Si no cabe (pantalla chica, tema Niños
 * o letra agrandada), lo oculta y muestra el botón ☰ con el menú lateral.
 * Al bajar por la página aparece una sombra suave en lugar de una línea.
 */
export function Cabecera() {
  const { data: menu } = useMenu()
  const { data: usuario } = useSesion()
  const { modoActivo } = useTema()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [buscarAbierto, setBuscarAbierto] = useState(false)
  const [conSombra, setConSombra] = useState(false)
  const [menuCabe, setMenuCabe] = useState(() => window.innerWidth >= 1280)
  const cerrarMenu = useCallback(() => setMenuAbierto(false), [])

  const fila = useRef<HTMLDivElement>(null)
  const logo = useRef<HTMLAnchorElement>(null)
  const listaMenu = useRef<HTMLUListElement>(null)
  const acciones = useRef<HTMLDivElement>(null)
  const hamburguesa = useRef<HTMLButtonElement>(null)

  const publico = menu?.publico ?? []
  const gestion = menu?.gestion ?? []

  // ¿Entran logo + menú + acciones en el ancho disponible?
  useLayoutEffect(() => {
    const elementos = [fila.current, logo.current, listaMenu.current, acciones.current]
    if (elementos.some((e) => !e)) return
    const [f, l, m, a] = elementos as HTMLElement[]

    const medir = () => {
      const estilo = getComputedStyle(f)
      const util = f.clientWidth - parseFloat(estilo.paddingLeft) - parseFloat(estilo.paddingRight)
      const espacio = parseFloat(estilo.columnGap) || 0
      // El botón ☰ no cuenta: desaparece cuando el menú está en la fila
      const boton = hamburguesa.current
      const anchoHamburguesa = boton && boton.offsetParent ? boton.offsetWidth + 4 : 0
      const necesario = l.offsetWidth + m.offsetWidth + (a.offsetWidth - anchoHamburguesa) + espacio * 2
      setMenuCabe(window.innerWidth >= ANCHO_ESCRITORIO && necesario <= util)
    }

    medir()
    const observador = new ResizeObserver(medir)
    elementos.forEach((e) => observador.observe(e as HTMLElement))
    return () => observador.disconnect()
  }, [])

  useEffect(() => {
    const revisar = () => setConSombra(window.scrollY > 4)
    revisar()
    window.addEventListener('scroll', revisar, { passive: true })
    return () => window.removeEventListener('scroll', revisar)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 bg-fondo/90 backdrop-blur-md transition-shadow duration-300 ${
        conSombra ? 'shadow-[0_8px_24px_-12px_rgb(15_30_69/0.35)]' : ''
      }`}
    >
      <div ref={fila} className="contenedor flex h-16 items-center gap-4 lg:h-18">
        <Link ref={logo} to="/" className="shrink-0" aria-label="Inicio: Carrera de Administración de Empresas">
          {/* Alto suficiente para que se lea el texto del logo oficial */}
          <LogoFcee version={modoActivo === 'oscuro' ? 'negativo' : 'positivo'} className="h-11 min-[375px]:h-12 lg:h-14" />
        </Link>

        {/* Cuando no cabe, el menú sigue en la página (invisible e inerte) solo para poder medirlo */}
        <nav
          aria-label="Navegación principal"
          aria-hidden={!menuCabe}
          inert={!menuCabe}
          className={menuCabe ? 'flex flex-1 justify-center' : 'pointer-events-none invisible absolute left-0 top-0 h-0 w-0 overflow-hidden'}
        >
          <MenuEscritorio ref={listaMenu} opciones={publico} />
        </nav>

        <div ref={acciones} className={`flex shrink-0 items-center gap-1 ${menuCabe ? '' : 'ml-auto'}`}>
          <div className="mr-1 hidden w-40 lg:block">
            <Buscador id="buscar-escritorio" placeholder="Buscar..." />
          </div>

          <button
            type="button"
            className={`${botonIcono} lg:hidden`}
            aria-label={buscarAbierto ? 'Cerrar búsqueda' : 'Abrir búsqueda'}
            aria-expanded={buscarAbierto}
            onClick={() => setBuscarAbierto(!buscarAbierto)}
          >
            {buscarAbierto ? <IconoCerrar /> : <IconoBuscar />}
          </button>

          <PanelAccesibilidad />

          <div className="hidden lg:block">
            {usuario ? (
              <MenuUsuario usuario={usuario} gestion={gestion} />
            ) : (
              <Link
                to="/ingresar"
                aria-label="Ingresar"
                title="Ingresar"
                className="grid h-10 w-10 place-items-center rounded-full border border-borde text-titulo transition-colors hover:border-titulo"
              >
                <IconoUsuario width={18} height={18} />
              </Link>
            )}
          </div>

          {!menuCabe && (
            <button ref={hamburguesa} type="button" className={botonIcono} aria-label="Abrir menú" onClick={() => setMenuAbierto(true)}>
              <IconoMenu />
            </button>
          )}
        </div>
      </div>

      {/* Búsqueda desplegable en celular y tablet */}
      {buscarAbierto && (
        <div className="contenedor pb-3 lg:hidden">
          <Buscador id="buscar-desplegable" autoFocus alBuscar={() => setBuscarAbierto(false)} />
        </div>
      )}

      {/* Si el menú vuelve a caber en la fila, el menú lateral se cierra solo */}
      <MenuMovil abierto={menuAbierto && !menuCabe} alCerrar={cerrarMenu} publico={publico} gestion={gestion} usuario={usuario} />
    </header>
  )
}
