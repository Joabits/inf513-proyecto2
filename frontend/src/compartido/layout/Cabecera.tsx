import { useCallback, useState } from 'react'
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

const botonIcono = 'grid h-10 w-10 place-items-center rounded-full text-titulo transition-colors hover:bg-superficie'

export function Cabecera() {
  const { data: menu } = useMenu()
  const { data: usuario } = useSesion()
  const { modoActivo } = useTema()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [buscarAbierto, setBuscarAbierto] = useState(false)
  const cerrarMenu = useCallback(() => setMenuAbierto(false), [])

  const publico = menu?.publico ?? []
  const gestion = menu?.gestion ?? []

  return (
    <header className="sticky top-0 z-40 border-b border-borde bg-fondo/95 backdrop-blur supports-[backdrop-filter]:bg-fondo/85">
      {/* Fila 1: marca, buscador y acciones */}
      <div className="contenedor flex h-16 items-center gap-3 md:h-20">
        <Link to="/" className="flex shrink-0 items-center gap-3" aria-label="Inicio: Carrera de Administración de Empresas">
          <LogoFcee version={modoActivo === 'oscuro' ? 'negativo' : 'positivo'} className="h-10 md:h-12" />
          <span className="hidden border-l border-borde pl-3 leading-tight xl:block">
            <span className="block text-[0.7rem] font-semibold uppercase tracking-wider text-texto-suave">Carrera de</span>
            <span className="block font-titulos text-base font-bold text-titulo">Administración de Empresas</span>
          </span>
        </Link>

        <div className="ml-auto hidden w-full max-w-xs lg:block">
          <Buscador id="buscar-escritorio" />
        </div>

        <div className="ml-auto flex items-center gap-1 lg:ml-2">
          <button
            type="button"
            className={`${botonIcono} lg:hidden`}
            aria-label={buscarAbierto ? 'Cerrar búsqueda' : 'Buscar'}
            aria-expanded={buscarAbierto}
            onClick={() => setBuscarAbierto(!buscarAbierto)}
          >
            {buscarAbierto ? <IconoCerrar /> : <IconoBuscar />}
          </button>

          <PanelAccesibilidad />

          {usuario ? (
            <span className="ml-2 hidden text-right text-xs leading-tight lg:block">
              <span className="block font-semibold text-titulo">{usuario.nombre}</span>
              <span className="text-texto-suave">{usuario.rol?.nombre}</span>
            </span>
          ) : (
            <Link
              to="/ingresar"
              className="ml-2 hidden items-center gap-2 rounded-full border border-borde px-4 py-2 text-sm font-semibold text-titulo transition-colors hover:border-primario hover:text-acento lg:flex"
            >
              <IconoUsuario width={16} height={16} /> Ingresar
            </Link>
          )}

          <button type="button" className={`${botonIcono} lg:hidden`} aria-label="Abrir menú" onClick={() => setMenuAbierto(true)}>
            <IconoMenu />
          </button>
        </div>
      </div>

      {/* Búsqueda desplegable en celular */}
      {buscarAbierto && (
        <div className="contenedor pb-3 lg:hidden">
          <Buscador id="buscar-desplegable" autoFocus alBuscar={() => setBuscarAbierto(false)} />
        </div>
      )}

      {/* Fila 2: menú dinámico en pantallas grandes */}
      <nav aria-label="Navegación principal" className="hidden border-t border-borde lg:block">
        <div className="contenedor flex items-center justify-between">
          <MenuEscritorio opciones={publico} />
          {gestion.length > 0 && (
            <div className="flex items-center gap-1 border-l border-borde pl-2">
              <span className="text-xs font-bold uppercase tracking-wider text-texto-suave">Gestión</span>
              <MenuEscritorio opciones={gestion} alineacion="derecha" />
            </div>
          )}
        </div>
      </nav>

      <MenuMovil abierto={menuAbierto} alCerrar={cerrarMenu} publico={publico} gestion={gestion} usuario={usuario} />
    </header>
  )
}
