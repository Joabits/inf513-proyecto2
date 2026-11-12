import { Link, Outlet, ScrollRestoration } from 'react-router'
import { MarcaCarrera } from '@/compartido/marca/LogoCarrera'
import { PanelAccesibilidad } from '@/compartido/tema/PanelAccesibilidad'
import { IconoAnterior, IconoCorrecto } from '@/compartido/ui/Iconos'
import { ContextoPlantilla } from './contextoPlantilla'
import { PieSimple } from './Pie'

const TAREAS = ['Portada, información institucional y documentos', 'Investigación, INNOVA y sus solicitudes', 'Noticias, eventos, usuarios y bitácora']

/**
 * Pantalla de acceso del personal. Cabecera de una fila como la del portal (logo y visualización a la misma altura);
 * debajo, en PC, la presentación del panel a la izquierda y el formulario a la derecha. Un solo fondo, sin líneas.
 */
export function PlantillaAcceso() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Los buscadores no deben mostrar la pantalla de ingreso */}
      <meta name="robots" content="noindex, nofollow" />
      <header className="contenedor flex h-16 items-center justify-between lg:h-18">
        <Link to="/" className="shrink-0" aria-label="Volver al portal">
          <MarcaCarrera />
        </Link>
        <PanelAccesibilidad />
      </header>

      <main id="contenido" className="contenedor grid flex-1 items-center gap-12 py-10 lg:grid-cols-2 lg:gap-20">
        <section aria-label="Panel de gestión" className="hidden max-w-md lg:block">
          <span aria-hidden="true" className="mb-6 block h-1 w-14 rounded-full bg-primario" />
          <p className="font-titulos text-4xl font-bold leading-tight text-titulo">Panel de gestión del portal</p>
          <p className="mt-4 text-lg text-texto-suave">Desde aquí el personal de la Carrera mantiene al día el contenido del portal.</p>
          <ul className="mt-8 space-y-3 text-texto">
            {TAREAS.map((tarea) => (
              <li key={tarea} className="flex items-start gap-3">
                <IconoCorrecto width={20} height={20} aria-hidden="true" className="mt-0.5 shrink-0 text-acento" />
                {tarea}
              </li>
            ))}
          </ul>
          <Link
            to="/"
            className="mt-10 inline-flex items-center gap-1.5 text-sm font-semibold text-titulo underline-offset-4 hover:text-acento hover:underline"
          >
            <IconoAnterior width={16} height={16} aria-hidden="true" /> Volver al portal
          </Link>
        </section>

        <div className="w-full">
          <ContextoPlantilla.Provider value="acceso">
            <Outlet />
          </ContextoPlantilla.Provider>
        </div>
      </main>

      <PieSimple enContenedor />
      <ScrollRestoration />
    </div>
  )
}
