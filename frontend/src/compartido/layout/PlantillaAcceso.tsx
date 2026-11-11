import { Link, Outlet, ScrollRestoration } from 'react-router'
import { LogoFcee } from '@/compartido/marca/LogoFcee'
import { useTema } from '@/compartido/tema/contexto'
import { PanelAccesibilidad } from '@/compartido/tema/PanelAccesibilidad'
import { IconoAnterior, IconoCorrecto } from '@/compartido/ui/Iconos'
import { ContextoPlantilla } from './contextoPlantilla'
import { PieSimple } from './Pie'

const TAREAS = ['Portada, información institucional y documentos', 'Investigación, INNOVA y sus solicitudes', 'Noticias, eventos, usuarios y bitácora']

/** Pantalla de acceso del personal: en PC, presentación a la izquierda y formulario a la derecha, con el fondo del modo. */
export function PlantillaAcceso() {
  const { modoActivo } = useTema()

  return (
    <div className="flex min-h-screen">
      {/* Los buscadores no deben mostrar la pantalla de ingreso */}
      <meta name="robots" content="noindex, nofollow" />
      <aside className="relative hidden w-[44%] max-w-2xl shrink-0 flex-col justify-between border-r border-borde-tarjeta bg-fondo p-12 text-texto sombra-lateral lg:flex xl:p-16">
        <Link to="/" className="relative self-start" aria-label="Volver al portal">
          <LogoFcee version={modoActivo === 'oscuro' ? 'negativo' : 'positivo'} className="h-14" />
        </Link>

        <div className="relative max-w-md">
          <span aria-hidden="true" className="mb-6 block h-1 w-14 rounded-full bg-primario" />
          <p className="font-titulos text-4xl font-bold leading-tight text-titulo">Panel de gestión del portal</p>
          <p className="mt-4 text-lg text-texto-suave">Desde aquí el personal de la Carrera mantiene al día el contenido del portal.</p>
          <ul className="mt-8 space-y-3">
            {TAREAS.map((tarea) => (
              <li key={tarea} className="flex items-start gap-3">
                <IconoCorrecto width={20} height={20} aria-hidden="true" className="mt-0.5 shrink-0 text-acento" />
                {tarea}
              </li>
            ))}
          </ul>
        </div>

        <Link to="/" className="relative inline-flex items-center gap-1.5 self-start text-sm font-semibold text-titulo underline-offset-4 hover:text-acento hover:underline">
          <IconoAnterior width={16} height={16} aria-hidden="true" /> Volver al portal
        </Link>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between px-4 lg:h-18 lg:justify-end lg:px-8">
          <Link to="/" className="shrink-0 lg:hidden" aria-label="Volver al portal">
            <LogoFcee version={modoActivo === 'oscuro' ? 'negativo' : 'positivo'} className="h-11 min-[375px]:h-12" />
          </Link>
          <PanelAccesibilidad />
        </header>
        <main id="contenido" className="flex flex-1 flex-col justify-center px-4 py-10 lg:px-8">
          <ContextoPlantilla.Provider value="acceso">
            <Outlet />
          </ContextoPlantilla.Provider>
        </main>
        <PieSimple />
      </div>
      <ScrollRestoration />
    </div>
  )
}
