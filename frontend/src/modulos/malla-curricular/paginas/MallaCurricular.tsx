import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Boton } from '@/compartido/ui/Boton'
import { CLASE_ENTRADA } from '@/compartido/ui/Campo'
import { EstadoCarga, MensajeError } from '@/compartido/ui/EstadoCarga'
import { ChipIcono } from '@/compartido/ui/ChipIcono'
import {
  type ComponenteIcono,
  IconoBuscar,
  IconoCalendario,
  IconoCorrecto,
  IconoDeslizar,
  IconoDocumento,
  IconoGraduacion,
  IconoHorario,
  IconoLibro,
  IconoMedalla,
} from '@/compartido/ui/Iconos'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { DetalleMateria } from '../componentes/DetalleMateria'
import { TarjetaMateria } from '../componentes/TarjetaMateria'
import { nombreSemestre, normalizar } from '../formato'
import { ESTILO_RELACION, type Relacion } from '../relacion'
import type { MateriaMalla } from '../tipos'
import { useMalla } from '../useMalla'

const LEYENDA: [string, string][] = [
  ['border-primario bg-primario', 'Materia elegida'],
  ['border-2 border-primario bg-fondo', 'Requisito para cursarla'],
  ['border-marino bg-marino', 'Materia que habilita'],
]

/** CU-02 Consultar malla curricular. Al elegir una materia se resaltan sus requisitos y lo que habilita. */
export function MallaCurricular() {
  const { data, isPending, isError, refetch } = useMalla()
  const [elegida, setElegida] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')

  // sigla -> materia y su semestre
  const indice = useMemo(() => {
    const mapa = new Map<string, { materia: MateriaMalla; semestre: number }>()
    for (const semestre of data?.semestres ?? []) {
      for (const materia of semestre.materias) mapa.set(materia.sigla, { materia, semestre: semestre.numero })
    }
    return mapa
  }, [data])
  const materias = useMemo(() => new Map([...indice].map(([sigla, { materia }]) => [sigla, materia])), [indice])

  if (isPending) return <EstadoCarga />

  if (isError) {
    return (
      <div className="mx-auto max-w-xl space-y-4 py-16 text-center">
        <MensajeError texto="No se pudo cargar la malla curricular." />
        <Boton variante="borde" onClick={() => refetch()}>
          Reintentar
        </Boton>
      </div>
    )
  }

  const { plan, semestres } = data
  const seleccion = elegida ? indice.get(elegida) : undefined
  const buscado = normalizar(busqueda.trim())

  const relacion = (materia: MateriaMalla): Relacion => {
    if (!seleccion) {
      return buscado && !normalizar(`${materia.sigla} ${materia.nombre}`).includes(buscado) ? 'atenuada' : 'normal'
    }
    if (materia.sigla === seleccion.materia.sigla) return 'elegida'
    if (seleccion.materia.prerrequisitos.includes(materia.sigla)) return 'requisito'
    if (seleccion.materia.habilita.includes(materia.sigla)) return 'habilita'
    return 'atenuada'
  }

  /** Las optativas de graduación se muestran juntas: se comportan como una sola materia. */
  const relacionOptativas = (optativas: MateriaMalla[]): Relacion => {
    const relaciones = optativas.map(relacion)
    for (const r of ['elegida', 'requisito', 'habilita', 'normal'] as Relacion[]) if (relaciones.includes(r)) return r
    return 'atenuada'
  }

  const elegir = (sigla: string) => setElegida((actual) => (actual === sigla ? null : sigla))

  const datos: [string, string, ComponenteIcono][] = plan
    ? [
        ['Plan', plan.codigo, IconoDocumento],
        ['Nivel', plan.nivel, IconoGraduacion],
        ['Sistema', plan.sistema, IconoCalendario],
        ['Duración', `${plan.semestres} semestres`, IconoHorario],
        ['Materias', String(plan.total_materias), IconoLibro],
        ['Créditos', String(plan.total_creditos), IconoMedalla],
      ]
    : []

  return (
    <div>
      <TituloPagina
        titulo="Malla curricular"
        subtitulo="Elija una materia para ver qué necesita aprobar antes y qué materias habilita."
      />

      {plan && (
        <section aria-label="Datos del plan de estudios" className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {datos.map(([etiqueta, valor, icono]) => (
              <div key={etiqueta} className="flex items-center gap-3 rounded-tema border border-borde bg-tarjeta p-4 sombra-suave">
                <ChipIcono icono={icono} tamano="sm" className="hidden sm:grid" />
                <div className="min-w-0">
                  <dt className="text-sm text-texto-suave">{etiqueta}</dt>
                  <dd className="text-lg font-bold leading-snug text-titulo">{valor}</dd>
                </div>
              </div>
            ))}
          </dl>
          {plan.titulaciones && (
            <div className="rounded-tema bg-banda p-6 text-sobre-marino">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                <IconoMedalla width={18} height={18} aria-hidden="true" /> Titulaciones intermedias
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-sobre-marino-suave">
                {plan.titulaciones.split('\n').map((linea) => (
                  <li key={linea} className="flex gap-2.5">
                    <IconoCorrecto width={18} height={18} aria-hidden="true" className="shrink-0 text-sobre-marino" />
                    {linea}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <section aria-label="Materias por semestre" className="mt-12 md:mt-16">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative lg:w-96">
            <span className="sr-only">Buscar una materia</span>
            <IconoBuscar className="pointer-events-none absolute left-3 top-1/2 mt-0.5 -translate-y-1/2 text-texto-suave" width={18} height={18} />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value)
                setElegida(null)
              }}
              placeholder="Buscar por sigla o nombre (ej. FIN-300, Costos)"
              className={`${CLASE_ENTRADA} mt-0 pl-10`}
            />
          </label>
          <ul aria-label="Significado de los colores" className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-texto">
            {LEYENDA.map(([clase, texto]) => (
              <li key={texto} className="flex items-center gap-2">
                <span className={`h-4 w-6 rounded border ${clase}`} aria-hidden="true" />
                {texto}
              </li>
            ))}
          </ul>
        </div>

        {/* En celular el detalle aparece abajo, sobre la malla; en PC, encima de ella */}
        <div aria-live="polite" className="fixed inset-x-0 bottom-0 z-40 max-h-[70vh] overflow-y-auto p-3 lg:static lg:z-auto lg:mt-6 lg:max-h-none lg:overflow-visible lg:p-0">
          {seleccion && (
            <div className="shadow-lg lg:shadow-none">
              <DetalleMateria
                materia={seleccion.materia}
                semestre={seleccion.semestre}
                materias={materias}
                alElegir={(sigla) => setElegida(sigla)}
                alCerrar={() => setElegida(null)}
              />
            </div>
          )}
        </div>

        <p className="mt-6 hidden items-center gap-2 text-sm text-texto-suave lg:flex">
          <IconoDeslizar width={18} height={18} aria-hidden="true" /> Deslice hacia los lados para ver los diez semestres.
        </p>
        <div className="mt-6 flex flex-col gap-8 lg:mt-2 lg:flex-row lg:gap-3 lg:overflow-x-auto lg:pb-4">
          {semestres.map((semestre) => {
            const optativas = semestre.materias.every((m) => m.optativa)
            return (
              <section key={semestre.numero} aria-labelledby={`semestre-${semestre.numero}`} className="lg:w-44 lg:shrink-0">
                <div className="mb-3 rounded-tema border-b-4 border-primario bg-banda px-3 py-2.5 text-sobre-marino">
                  <h2 id={`semestre-${semestre.numero}`} className="text-base">
                    {nombreSemestre(semestre.numero)}
                  </h2>
                  <p className="text-xs text-sobre-marino-suave">
                    {optativas ? 'Graduación' : `${semestre.materias.length} materias · ${semestre.totales.creditos} créditos`}
                  </p>
                </div>

                {optativas ? (
                  <button
                    type="button"
                    onClick={() => elegir(semestre.materias[0].sigla)}
                    aria-pressed={relacionOptativas(semestre.materias) === 'elegida'}
                    className={`flex w-full flex-col rounded-tema border p-3 text-left transition ${ESTILO_RELACION[relacionOptativas(semestre.materias)]}`}
                  >
                    <span className="text-sm font-semibold leading-snug">Materia optativa de graduación</span>
                    <span className="mt-1 text-xs">Elija una: {semestre.materias.map((m) => m.sigla).join(' · ')}</span>
                  </button>
                ) : (
                  <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                    {semestre.materias.map((materia) => (
                      <li key={materia.sigla}>
                        <TarjetaMateria materia={materia} relacion={relacion(materia)} alElegir={() => elegir(materia.sigla)} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )
          })}
        </div>

        {plan?.nota_graduacion && <p className="mt-8 max-w-3xl text-sm text-texto-suave">{plan.nota_graduacion}</p>}
      </section>

      <p className="mt-10 text-sm text-texto-suave">
        ¿Tiene dudas sobre el plan de estudios?{' '}
        <Link to="/contacto" className="font-semibold text-titulo underline-offset-4 hover:text-acento hover:underline">
          Escríbanos
        </Link>
        .
      </p>
    </div>
  )
}
