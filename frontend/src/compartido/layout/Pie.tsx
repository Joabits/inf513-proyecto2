import { LogoFcee } from '@/compartido/marca/LogoFcee'
import { useContadorVisitas } from '@/compartido/visitas/useContadorVisitas'

const ANIO = new Date().getFullYear()

/**
 * Pie de página de todas las páginas.
 * Los datos de contacto y redes son provisionales: el módulo de configuración (CU-28)
 * los reemplazará con datos de la BD.
 */
export function Pie() {
  const visitas = useContadorVisitas()

  return (
    <footer className="mt-16 bg-marino-oscuro text-white">
      <div className="h-1.5 bg-primario" />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <LogoFcee version="negativo" className="h-14" />
          <p className="mt-4 font-titulos text-lg font-bold">Carrera de Administración de Empresas</p>
          <p className="mt-1 text-sm opacity-80">Carrera acreditada ante el CEUB.</p>
        </div>
        <div>
          <p className="font-semibold">Contacto</p>
          <p className="mt-2 text-sm opacity-80">Av. Busch, Ciudad Universitaria, Módulo 255</p>
          <p className="text-sm opacity-80">Santa Cruz de la Sierra, Bolivia</p>
          <p className="text-sm opacity-60">(datos de contacto pendientes)</p>
        </div>
        <div>
          <p className="font-semibold">Visitas a esta página</p>
          <p className="mt-2 text-3xl font-bold" aria-live="polite">
            {visitas === null ? '—' : visitas.toLocaleString('es-BO')}
          </p>
        </div>
      </div>
      <p className="border-t border-white/15 py-4 text-center text-xs opacity-70">
        © {ANIO} Carrera de Administración de Empresas · FCEE · UAGRM
      </p>
    </footer>
  )
}
