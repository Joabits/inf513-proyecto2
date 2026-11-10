import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useMenu } from '@/compartido/menu/useMenu'
import { LogoFcee } from '@/compartido/marca/LogoFcee'
import { useSesion } from '@/compartido/sesion/useSesion'
import { useTema } from '@/compartido/tema/contexto'
import { PanelAccesibilidad } from '@/compartido/tema/PanelAccesibilidad'
import { MenuDinamico } from './MenuDinamico'

export function Cabecera() {
  const { data: menu } = useMenu()
  const { data: usuario } = useSesion()
  const navegar = useNavigate()
  const { modoActivo } = useTema()
  const [menuMovil, setMenuMovil] = useState(false)
  const [busqueda, setBusqueda] = useState('')

  // Búsqueda en el header (requisito 9). La página de resultados es del módulo de búsqueda (CU-07).
  function buscar(e: FormEvent) {
    e.preventDefault()
    const texto = busqueda.trim()
    if (texto) navegar(`/buscar?q=${encodeURIComponent(texto)}`)
  }

  return (
    <header>
      {/* Franja superior */}
      <div className="bg-marino-oscuro text-xs text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5">
          <span>UNIVERSIDAD AUTÓNOMA GABRIEL RENÉ MORENO | FCEE</span>
          {usuario ? (
            <span>
              {usuario.nombre} · <strong>{usuario.rol?.nombre}</strong>
            </span>
          ) : (
            <Link to="/ingresar" className="font-semibold hover:underline">
              Ingresar
            </Link>
          )}
        </div>
      </div>

      {/* Marca, buscador y accesibilidad */}
      <div className="border-b border-borde bg-fondo">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-4">
          <Link to="/" className="flex items-center gap-4" aria-label="Ir al inicio: Carrera de Administración de Empresas">
            {/* Logo oficial de la FCEE (la carrera no tiene logo propio, según el manual de marca) */}
            <LogoFcee version={modoActivo === 'oscuro' ? 'negativo' : 'positivo'} className="h-14 md:h-16" />
            <span className="hidden border-l-2 border-primario pl-4 leading-tight sm:block">
              <span className="block text-xs font-semibold uppercase tracking-wide text-texto-suave">Carrera de</span>
              <span className="block font-titulos text-lg font-extrabold text-titulo">Administración de Empresas</span>
            </span>
          </Link>

          <form onSubmit={buscar} role="search" className="order-last flex w-full gap-2 md:order-none md:ml-auto md:w-auto">
            <label htmlFor="buscar" className="sr-only">
              Buscar en el portal
            </label>
            <input
              id="buscar"
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar noticias, documentos, materias..."
              className="w-full rounded-tema border border-borde bg-fondo px-3 py-2 text-texto md:w-72"
            />
            <button type="submit" className="rounded-tema bg-primario px-4 py-2 font-semibold text-sobre-primario hover:bg-marino">
              Buscar
            </button>
          </form>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <PanelAccesibilidad />
            <button
              type="button"
              className="rounded-tema border border-borde px-3 py-2 lg:hidden"
              aria-expanded={menuMovil}
              aria-controls="navegacion"
              onClick={() => setMenuMovil(!menuMovil)}
            >
              Menú
            </button>
          </div>
        </div>
      </div>

      {/* Menú dinámico */}
      <nav id="navegacion" aria-label="Navegación principal" className={`border-b-4 border-primario bg-marino text-white ${menuMovil ? '' : 'hidden lg:block'}`}>
        <div className="mx-auto max-w-7xl px-4 py-2">
          <MenuDinamico opciones={menu?.publico ?? []} alNavegar={() => setMenuMovil(false)} />
        </div>
        {menu && menu.gestion.length > 0 && (
          <div className="border-t border-white/15 bg-marino-oscuro">
            <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-1">
              <span className="text-xs font-bold uppercase tracking-wide">Gestión</span>
              <MenuDinamico opciones={menu.gestion} alNavegar={() => setMenuMovil(false)} />
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
