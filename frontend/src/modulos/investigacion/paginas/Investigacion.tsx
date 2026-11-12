import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Boton } from '@/compartido/ui/Boton'
import { CLASE_ENTRADA } from '@/compartido/ui/Campo'
import { ChipIcono } from '@/compartido/ui/ChipIcono'
import { EstadoCarga, MensajeError } from '@/compartido/ui/EstadoCarga'
import { IconoBuscar, IconoFlecha, IconoInstitucion, IconoLibro } from '@/compartido/ui/Iconos'
import { opcionesDe } from '@/compartido/ui/opciones'
import { Selector } from '@/compartido/ui/Selector'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { SeccionSemilleros } from '../componentes/SeccionSemilleros'
import { TarjetaProyecto } from '../componentes/TarjetaProyecto'
import { numero, parrafos } from '../formato'
import { ESTADOS, TIPOS } from '../tipos'
import { useInvestigacionPublica } from '../useInvestigacion'

const ANTETITULO = 'text-sm font-bold uppercase tracking-widest text-acento'
const FILTROS = ['q', 'linea', 'tipo', 'estado'] as const

const sinTildes = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

/**
 * Página pública de investigación (CU-03). Los filtros de proyectos viven en la URL
 * (?linea=3&estado=en_curso): se pueden compartir y el botón Atrás los respeta.
 */
export function Investigacion() {
  const { data, isPending, isError, refetch } = useInvestigacionPublica()
  const [parametros, setParametros] = useSearchParams()
  const filtro = Object.fromEntries(FILTROS.map((clave) => [clave, parametros.get(clave) ?? ''])) as Record<(typeof FILTROS)[number], string>

  function filtrar(clave: (typeof FILTROS)[number], valor: string) {
    setParametros(
      (actuales) => {
        if (valor) actuales.set(clave, valor)
        else actuales.delete(clave)
        return actuales
      },
      { replace: true, preventScrollReset: true },
    )
  }

  const proyectos = useMemo(() => data?.proyectos ?? [], [data])
  const visibles = useMemo(() => {
    const buscado = sinTildes(filtro.q.trim())
    return proyectos.filter(
      (p) =>
        (!filtro.linea || String(p.linea?.id) === filtro.linea) &&
        (!filtro.tipo || p.tipo === filtro.tipo) &&
        (!filtro.estado || p.estado === filtro.estado) &&
        (!buscado || sinTildes(`${p.titulo} ${p.responsable} ${p.integrantes ?? ''}`).includes(buscado)),
    )
  }, [proyectos, filtro.q, filtro.linea, filtro.tipo, filtro.estado])

  if (isPending) return <EstadoCarga />

  if (isError) {
    return (
      <div className="mx-auto max-w-xl space-y-4 py-16 text-center">
        <MensajeError texto="No se pudo cargar la información de investigación." />
        <Boton variante="borde" onClick={() => refetch()}>
          Reintentar
        </Boton>
      </div>
    )
  }

  const { lineas, contenido, semilleros } = data
  const hayFiltros = FILTROS.some((clave) => filtro[clave])
  const haySemilleros = semilleros.length > 0 || !!contenido?.semilleros_presentacion

  function verProyectosDe(idLinea: number) {
    setParametros({ linea: String(idLinea) }, { replace: true, preventScrollReset: true })
    document.getElementById('proyectos')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const secciones = [
    lineas.length > 0 && { id: 'lineas', titulo: 'Líneas' },
    { id: 'proyectos', titulo: 'Proyectos' },
    haySemilleros && { id: 'semilleros', titulo: 'Semilleros' },
    contenido?.pia_presentacion && { id: 'aula', titulo: 'Investigación en aula' },
  ].filter((seccion) => !!seccion)

  return (
    <div className="mx-auto max-w-6xl">
      <TituloPagina titulo="Investigación" subtitulo="Líneas, proyectos y semilleros de investigación de la Carrera de Administración de Empresas." />

      <nav aria-label="En esta página" className="-mt-4 mb-12 flex flex-wrap gap-2 md:mb-16">
        {secciones.map(({ id, titulo }) => (
          <a
            key={id}
            href={`#${id}`}
            className="rounded-full border border-borde px-4 py-1.5 text-sm font-semibold text-titulo transition-colors hover:border-primario hover:text-acento"
          >
            {titulo}
          </a>
        ))}
      </nav>

      {lineas.length > 0 && (
        <section id="lineas" aria-labelledby="titulo-lineas" className="scroll-mt-28">
          <p className={ANTETITULO}>Hacia dónde investigamos</p>
          <h2 id="titulo-lineas" className="mt-2 text-3xl text-titulo">
            {lineas.length} líneas de investigación
          </h2>
          <ol className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {lineas.map((linea, i) => (
              <li key={linea.id} className="flex flex-col rounded-tema border border-borde-tarjeta bg-tarjeta p-6 sombra-suave">
                <span aria-hidden="true" className="text-3xl font-bold leading-none text-acento">
                  {numero(i + 1)}
                </span>
                <h3 className="mt-4 text-lg font-bold leading-snug text-titulo">{linea.nombre}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-texto">{linea.descripcion}</p>
                {/* Sin proyectos la tarjeta queda limpia: repetir «sin proyectos» en cada línea solo es ruido */}
                {linea.proyectos > 0 && (
                  <div className="mt-5 border-t border-borde pt-4 text-sm">
                    <button
                      type="button"
                      onClick={() => verProyectosDe(linea.id)}
                      className="inline-flex items-center gap-2 font-semibold text-titulo hover:text-acento"
                    >
                      Ver {linea.proyectos} {linea.proyectos === 1 ? 'proyecto' : 'proyectos'}
                      <IconoFlecha width={16} height={16} aria-hidden="true" />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      <section id="proyectos" aria-labelledby="titulo-proyectos" className="mt-16 scroll-mt-28 md:mt-24">
        <p className={ANTETITULO}>Lo que estamos investigando</p>
        <h2 id="titulo-proyectos" className="mt-2 text-3xl text-titulo">
          Proyectos de investigación
        </h2>

        {proyectos.length === 0 ? (
          <div className="mt-8 rounded-tema border border-borde-tarjeta bg-tarjeta px-6 py-12 text-center sombra-suave">
            <p className="font-semibold text-titulo">Los proyectos se publicarán pronto.</p>
            <p className="mt-1 text-texto-suave">Aquí aparecerán los proyectos de investigación, de aula y de semilleros de la Carrera.</p>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-[2fr_1.4fr_1fr_1fr]">
              <label className="relative md:col-span-2 lg:col-span-1">
                <span className="sr-only">Buscar proyectos</span>
                <IconoBuscar className="pointer-events-none absolute left-3 top-1/2 mt-0.5 -translate-y-1/2 text-texto-suave" width={18} height={18} />
                <input
                  type="search"
                  value={filtro.q}
                  onChange={(e) => filtrar('q', e.target.value)}
                  placeholder="Buscar por título, responsable o integrantes"
                  className={`${CLASE_ENTRADA} pl-10`}
                />
              </label>
              <Selector
                aria-label="Filtrar por línea"
                valor={filtro.linea}
                alCambiar={(valor) => filtrar('linea', valor)}
                opciones={[{ valor: '', etiqueta: 'Todas las líneas' }, ...lineas.map((l) => ({ valor: String(l.id), etiqueta: l.nombre }))]}
              />
              <Selector
                aria-label="Filtrar por tipo"
                valor={filtro.tipo}
                alCambiar={(valor) => filtrar('tipo', valor)}
                opciones={[{ valor: '', etiqueta: 'Todos los tipos' }, ...opcionesDe(TIPOS)]}
              />
              <Selector
                aria-label="Filtrar por estado"
                valor={filtro.estado}
                alCambiar={(valor) => filtrar('estado', valor)}
                opciones={[{ valor: '', etiqueta: 'Todos los estados' }, ...opcionesDe(ESTADOS)]}
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <p className="text-texto-suave" aria-live="polite">
                {visibles.length === proyectos.length
                  ? `${proyectos.length} ${proyectos.length === 1 ? 'proyecto' : 'proyectos'}`
                  : `${visibles.length} de ${proyectos.length} proyectos`}
              </p>
              {hayFiltros && (
                <button
                  type="button"
                  onClick={() => setParametros({}, { replace: true, preventScrollReset: true })}
                  className="font-semibold text-acento underline-offset-4 hover:underline"
                >
                  Quitar filtros
                </button>
              )}
            </div>

            {visibles.length > 0 ? (
              <ul className="mt-4 grid gap-5 lg:grid-cols-2">
                {visibles.map((proyecto) => (
                  <li key={proyecto.id}>
                    <TarjetaProyecto proyecto={proyecto} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-10 text-center text-texto-suave">Ningún proyecto coincide con los filtros.</p>
            )}
          </>
        )}
      </section>

      {haySemilleros && (
        <div className="mt-16 md:mt-24">
          <SeccionSemilleros contenido={contenido} semilleros={semilleros} />
        </div>
      )}

      {contenido?.pia_presentacion && (
        <section id="aula" aria-labelledby="titulo-aula" className="mt-16 scroll-mt-28 md:mt-24">
          <div className="grid gap-6 rounded-tema border border-borde-tarjeta bg-tarjeta p-6 sombra-suave md:grid-cols-[auto_1fr] md:gap-8 md:p-10">
            <ChipIcono icono={IconoLibro} tamano="lg" />
            <div>
              <p className={ANTETITULO}>Proyectos de Investigación en Aula</p>
              <h2 id="titulo-aula" className="mt-2 text-2xl text-titulo md:text-3xl">
                Investigación en aula (PIA)
              </h2>
              <div className="mt-4 space-y-4 leading-relaxed text-texto">
                {parrafos(contenido.pia_presentacion).map((parrafo, i) => (
                  <p key={i}>{parrafo}</p>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Cierre: el instituto de la Facultad y una invitación a participar */}
      <section className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-borde pt-10 md:mt-20 md:flex-row md:items-center">
        <div className="flex max-w-2xl items-start gap-4">
          {contenido?.instituto && <ChipIcono icono={IconoInstitucion} className="hidden sm:grid" />}
          <div>
            <h2 className="text-2xl text-titulo">¿Quiere participar en investigación?</h2>
            <p className="mt-2 text-texto-suave">
              {contenido?.instituto ? `${contenido.instituto} ` : ''}Escríbanos para sumarse a un semillero o proponer un proyecto.
            </p>
          </div>
        </div>
        <Link
          to="/contacto"
          className="inline-flex shrink-0 items-center gap-2 rounded-tema bg-primario px-5 py-3 font-semibold text-sobre-primario transition-colors hover:bg-marino"
        >
          Contactar a la Carrera <IconoFlecha width={18} height={18} aria-hidden="true" />
        </Link>
      </section>
    </div>
  )
}
