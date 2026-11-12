import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { usePermiso } from '@/compartido/sesion/usePermiso'
import { Boton } from '@/compartido/ui/Boton'
import { CLASE_ENTRADA } from '@/compartido/ui/Campo'
import { EstadoCarga, MensajeError } from '@/compartido/ui/EstadoCarga'
import { IconoAgregar, IconoBuscar } from '@/compartido/ui/Iconos'
import { opcionesDe } from '@/compartido/ui/opciones'
import { Pestanas } from '@/compartido/ui/Pestanas'
import { Selector } from '@/compartido/ui/Selector'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { FilaProyecto } from '../componentes/FilaProyecto'
import { FormComplementos } from '../componentes/FormComplementos'
import { FormLineas } from '../componentes/FormLineas'
import { FormProyecto } from '../componentes/FormProyecto'
import { TIPOS, type GestionInvestigacion as Datos } from '../tipos'
import { useGestionInvestigacion } from '../useInvestigacion'

const SECCIONES = [
  { id: 'proyectos', titulo: 'Proyectos' },
  { id: 'lineas', titulo: 'Líneas de investigación' },
  { id: 'semilleros', titulo: 'Semilleros y PIA' },
]

const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

function Proyectos({ datos }: { datos: Datos }) {
  const puedeCrear = usePermiso('investigacion.crear')
  const [creando, setCreando] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [linea, setLinea] = useState('')
  const [tipo, setTipo] = useState('')
  const { proyectos, lineas } = datos

  const visibles = useMemo(() => {
    const buscado = normalizar(busqueda.trim())
    return proyectos.filter(
      (p) =>
        (!linea || String(p.linea?.id ?? 'ninguna') === linea) &&
        (!tipo || p.tipo === tipo) &&
        (!buscado || normalizar(`${p.titulo} ${p.responsable} ${p.integrantes ?? ''}`).includes(buscado)),
    )
  }, [proyectos, busqueda, linea, tipo])

  return (
    <>
      {puedeCrear && !creando && (
        <Boton type="button" onClick={() => setCreando(true)} className="mb-6 inline-flex items-center gap-2">
          <IconoAgregar width={18} height={18} /> Registrar proyecto
        </Boton>
      )}

      {creando && (
        <section aria-labelledby="titulo-nuevo-proyecto" className="mb-10 rounded-tema border border-borde-tarjeta bg-tarjeta p-5 sombra-suave md:p-6">
          <h2 id="titulo-nuevo-proyecto" className="mb-6 text-xl text-titulo">
            Nuevo proyecto
          </h2>
          <FormProyecto lineas={lineas} alTerminar={() => setCreando(false)} />
        </section>
      )}

      {proyectos.length === 0 && !creando && (
        <div className="rounded-tema border border-borde-tarjeta bg-tarjeta px-6 py-12 text-center sombra-suave">
          <p className="font-semibold text-titulo">Todavía no hay proyectos registrados.</p>
          <p className="mt-1 text-texto-suave">Los proyectos de investigación, de aula (PIA) y de semilleros aparecerán aquí.</p>
        </div>
      )}

      {proyectos.length > 0 && (
        <>
          <div className="flex flex-col gap-3 lg:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Buscar proyectos</span>
              <IconoBuscar className="pointer-events-none absolute left-3 top-1/2 mt-0.5 -translate-y-1/2 text-texto-suave" width={18} height={18} />
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por título, responsable o integrantes"
                className={`${CLASE_ENTRADA} pl-10`}
              />
            </label>
            <Selector
              aria-label="Filtrar por línea"
              className="lg:w-64"
              valor={linea}
              alCambiar={setLinea}
              opciones={[
                { valor: '', etiqueta: 'Todas las líneas' },
                ...lineas.map((l) => ({ valor: String(l.id), etiqueta: l.nombre })),
                { valor: 'ninguna', etiqueta: 'Sin línea asignada' },
              ]}
            />
            <Selector
              aria-label="Filtrar por tipo"
              className="lg:w-56"
              valor={tipo}
              alCambiar={setTipo}
              opciones={[{ valor: '', etiqueta: 'Todos los tipos' }, ...opcionesDe(TIPOS)]}
            />
          </div>

          <p className="mt-6 text-sm text-texto-suave" aria-live="polite">
            {visibles.length === proyectos.length
              ? `${proyectos.length} ${proyectos.length === 1 ? 'proyecto' : 'proyectos'}`
              : `${visibles.length} de ${proyectos.length} proyectos`}
          </p>

          {visibles.length > 0 ? (
            <ul className="space-y-3">
              {visibles.map((proyecto) => (
                <FilaProyecto key={proyecto.id} proyecto={proyecto} lineas={lineas} />
              ))}
            </ul>
          ) : (
            <p className="py-10 text-center text-texto-suave">Ningún proyecto coincide con la búsqueda.</p>
          )}
        </>
      )}
    </>
  )
}

/** CU-19 Gestionar investigación. */
export function GestionInvestigacion() {
  const { data, isPending, isError, refetch } = useGestionInvestigacion()
  const editable = usePermiso('investigacion.editar')
  const [parametros, setParametros] = useSearchParams()
  const pedida = parametros.get('seccion')
  const activa = SECCIONES.some((s) => s.id === pedida) ? pedida! : SECCIONES[0].id

  return (
    <div className="mx-auto max-w-4xl">
      <TituloPagina titulo="Investigación" subtitulo="Proyectos, líneas de investigación, semilleros y Proyectos de Investigación en Aula (PIA)." />

      {isPending && <EstadoCarga />}

      {isError && (
        <div className="space-y-4 text-center">
          <MensajeError />
          <Boton variante="borde" onClick={() => refetch()}>
            Reintentar
          </Boton>
        </div>
      )}

      {data && (
        <>
          <Pestanas
            etiqueta="Secciones de investigación"
            opciones={SECCIONES}
            activa={activa}
            alCambiar={(id) => setParametros({ seccion: id }, { replace: true })}
          />

          {/* Los paneles ocultos siguen montados: cambiar de pestaña no pierde lo escrito */}
          <div role="tabpanel" id="panel-proyectos" aria-labelledby="pestana-proyectos" hidden={activa !== 'proyectos'} className="pt-6">
            <Proyectos datos={data} />
          </div>
          <div role="tabpanel" id="panel-lineas" aria-labelledby="pestana-lineas" hidden={activa !== 'lineas'} className="pt-6">
            <fieldset disabled={!editable} className="min-w-0">
              <FormLineas lineas={data.lineas} />
            </fieldset>
          </div>
          <div role="tabpanel" id="panel-semilleros" aria-labelledby="pestana-semilleros" hidden={activa !== 'semilleros'} className="pt-6">
            <fieldset disabled={!editable} className="min-w-0">
              <FormComplementos complementos={data} />
            </fieldset>
          </div>
        </>
      )}
    </div>
  )
}
