import { Link } from 'react-router'
import { IconoFlecha } from '@/compartido/ui/Iconos'

/**
 * Página de inicio PROVISIONAL de la base común.
 * El módulo de página de inicio (CU-12) la reemplaza con banners y destacados de la BD.
 */
const CIFRAS = [
  ['1970', 'Año de fundación'],
  ['10', 'Semestres'],
  ['47', 'Materias'],
  ['11', 'Líneas de investigación'],
]

const ACCESOS = [
  ['Malla curricular', '/malla-curricular', 'Plan 101-4 y prerrequisitos de cada materia.'],
  ['Investigación', '/investigacion', 'Líneas de investigación, PIA y semilleros.'],
  ['Revista INNOVAR', '/revista-innovar', 'Revista académica de la Carrera.'],
  ['Noticias y eventos', '/noticias', 'Actividades, comunicados y agenda.'],
]

export function Inicio() {
  return (
    <>
      {/* Presentación */}
      <section className="grid items-center gap-10 py-4 md:py-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-acento">
            <span className="h-2 w-2 rounded-full bg-primario" aria-hidden="true" />
            Carrera acreditada ante el CEUB
          </p>
          <h1 className="text-4xl leading-tight text-titulo sm:text-5xl lg:text-6xl">Administración de Empresas</h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-texto-suave sm:text-lg">
            Formamos profesionales capacitados para gerenciar y liderar organizaciones de todo tipo, con visión
            estratégica, innovación y compromiso con el desarrollo empresarial.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/malla-curricular"
              className="inline-flex items-center justify-center gap-2 rounded-tema bg-primario px-6 py-3 font-semibold text-sobre-primario transition-colors hover:bg-marino"
            >
              Ver malla curricular <IconoFlecha width={18} height={18} />
            </Link>
            <Link
              to="/contacto"
              className="inline-flex items-center justify-center rounded-tema border border-borde px-6 py-3 font-semibold text-titulo transition-colors hover:border-primario hover:text-acento"
            >
              Contacto
            </Link>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-tema border border-borde bg-borde">
          {CIFRAS.map(([numero, texto]) => (
            <div key={texto} className="bg-fondo p-6 sm:p-8">
              <dt className="sr-only">{texto}</dt>
              <dd>
                <span className="block font-titulos text-3xl font-extrabold text-titulo sm:text-4xl">{numero}</span>
                <span className="mt-1 block text-sm text-texto-suave">{texto}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Accesos rápidos */}
      <section aria-labelledby="explora" className="mt-14 md:mt-20">
        <h2 id="explora" className="mb-6 text-2xl text-titulo">
          Explora la Carrera
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ACCESOS.map(([titulo, ruta, texto]) => (
            <Link
              key={ruta}
              to={ruta}
              className="group flex flex-col rounded-tema border border-borde p-6 transition-colors hover:border-primario"
            >
              <h3 className="text-lg text-titulo group-hover:text-acento">{titulo}</h3>
              <p className="mt-2 flex-1 text-sm text-texto-suave">{texto}</p>
              <IconoFlecha className="mt-4 text-acento transition-transform group-hover:translate-x-1" width={18} height={18} />
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
