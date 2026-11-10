import { LogoFcee } from '@/compartido/marca/LogoFcee'
import { useTema } from '@/compartido/tema/contexto'
import { useContadorVisitas } from '@/compartido/visitas/useContadorVisitas'

const ANIO = new Date().getFullYear()

const ENLACES = [
  ['UAGRM', 'https://www.uagrm.edu.bo'],
  ['Facultad (FCEE)', 'https://www.uagrm.edu.bo/facultades/fcee'],
  ['Inscripciones', 'https://inscripcion.uagrm.edu.bo/'],
  ['Bibliotecas', 'https://bibliotecas.uagrm.edu.bo'],
]

/**
 * Pie de todas las páginas, con el contador de visitas (req. 7).
 * Usa los colores del tema: blanco de día y azul oscuro de noche.
 * Los datos de contacto son provisionales: el módulo de configuración (CU-28) los traerá de la BD.
 */
export function Pie() {
  const visitas = useContadorVisitas()
  const { modoActivo } = useTema()

  return (
    <footer className="mt-auto border-t border-borde bg-fondo text-texto">
      <div className="contenedor grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div className="sm:col-span-2 lg:col-span-1">
          <LogoFcee version={modoActivo === 'oscuro' ? 'negativo' : 'positivo'} className="h-12" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-texto-suave">
            Carrera de Administración de Empresas. Formamos profesionales para gerenciar y liderar organizaciones.
            Acreditada ante el CEUB.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-titulo">Contacto</h2>
          <address className="mt-4 space-y-1 text-sm not-italic text-texto-suave">
            <p>Av. Busch, Ciudad Universitaria</p>
            <p>Módulo 255 · Santa Cruz de la Sierra</p>
            <p className="opacity-70">(datos de contacto pendientes)</p>
          </address>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-titulo">Enlaces</h2>
          <ul className="mt-4 space-y-1 text-sm">
            {ENLACES.map(([texto, url]) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-texto-suave hover:text-acento hover:underline">
                  {texto}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-borde">
        <div className="contenedor flex flex-col gap-2 py-4 text-xs text-texto-suave sm:flex-row sm:items-center sm:justify-between">
          <p>© {ANIO} Carrera de Administración de Empresas · FCEE · UAGRM</p>
          <p aria-live="polite">
            Visitas a esta página:{' '}
            <strong className="text-sm text-titulo">{visitas === null ? '—' : visitas.toLocaleString('es-BO')}</strong>
          </p>
        </div>
      </div>
    </footer>
  )
}
