import { useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { Boton } from '@/compartido/ui/Boton'
import { EstadoCarga, MensajeError } from '@/compartido/ui/EstadoCarga'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import type { Estadisticas as Datos, Periodo } from '../tipos'
import { useEstadisticas } from '../useEstadisticas'

const PERIODOS: { dias: Periodo; texto: string }[] = [
  { dias: 7, texto: '7 días' },
  { dias: 30, texto: '30 días' },
  { dias: 90, texto: '90 días' },
]

const NUMERO = new Intl.NumberFormat('es-BO')
const DIA = new Intl.DateTimeFormat('es-BO', { day: 'numeric', month: 'short', timeZone: 'UTC' })
const TARJETA = 'rounded-tema border border-borde-tarjeta bg-tarjeta p-5 sombra-suave sm:p-6'

const ACCIONES: Record<string, string> = {
  crear: 'Creaciones',
  editar: 'Ediciones',
  eliminar: 'Eliminaciones',
  publicar: 'Publicaciones',
  ocultar: 'Ocultamientos',
  atender: 'Mensajes atendidos',
  exportar: 'Exportaciones',
}

/** «/» → Inicio; «/malla-curricular» → Malla curricular; «/noticias/12» → Noticias 12 */
function nombrePagina(ruta: string) {
  if (ruta === '/') return 'Inicio'
  const texto = ruta.replace(/^\//, '').replaceAll('/', ' ').replaceAll('-', ' ')
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

const nombreAccion = (accion: string) => ACCIONES[accion] ?? accion.charAt(0).toUpperCase() + accion.slice(1)

function Cifra({ valor, etiqueta, destino }: { valor: number; etiqueta: string; destino?: string }) {
  const contenido = (
    <>
      <dd className="font-titulos text-3xl font-extrabold tabular-nums text-titulo">{NUMERO.format(valor)}</dd>
      <dt className="mt-1 text-sm text-texto-suave">{etiqueta}</dt>
    </>
  )
  return destino ? (
    <Link to={destino} className={`${TARJETA} flex flex-col-reverse transition hover:sombra-elevada`}>
      {contenido}
    </Link>
  ) : (
    <div className={`${TARJETA} flex flex-col-reverse`}>{contenido}</div>
  )
}

/** Lista ordenada con barras horizontales de un solo color (la magnitud se lee por el largo y por el número al lado). */
function Ranking({ titulo, filas, vacio }: { titulo: string; filas: { nombre: string; total: number }[]; vacio: string }) {
  const maximo = Math.max(1, ...filas.map((f) => f.total))
  return (
    <section aria-label={titulo} className={TARJETA}>
      <h2 className="text-lg text-titulo">{titulo}</h2>
      {filas.length === 0 ? (
        <p className="mt-4 text-sm text-texto-suave">{vacio}</p>
      ) : (
        <ol className="mt-4 space-y-3">
          {filas.map((fila) => (
            <li key={fila.nombre} title={`${fila.nombre}: ${NUMERO.format(fila.total)}`}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate text-texto">{fila.nombre}</span>
                <span className="shrink-0 font-semibold tabular-nums text-titulo">{NUMERO.format(fila.total)}</span>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-superficie" aria-hidden="true">
                <div className="h-2 rounded-full bg-titulo" style={{ width: `${(fila.total / maximo) * 100}%` }} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

/** Visitas por día: columnas de un solo color; al pasar el cursor (o con el teclado) se ve la fecha y el total. */
function VisitasPorDia({ datos }: { datos: Datos['visitas']['por_dia'] }) {
  const [elegido, setElegido] = useState<number | null>(null)
  const maximo = Math.max(1, ...datos.map((d) => d.total))
  const actual = elegido !== null ? datos[elegido] : null

  return (
    <section aria-label="Visitas por día" className={TARJETA}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg text-titulo">Visitas por día</h2>
        <p className="text-sm text-texto-suave" aria-live="polite">
          {actual ? `${DIA.format(new Date(actual.fecha))}: ${NUMERO.format(actual.total)} visitas` : 'Pase el cursor sobre una columna'}
        </p>
      </div>

      <div className="mt-5 flex h-44 items-end gap-0.5 border-b border-borde" onMouseLeave={() => setElegido(null)}>
        {datos.map((d, i) => (
          <button
            key={d.fecha}
            type="button"
            aria-label={`${DIA.format(new Date(d.fecha))}: ${d.total} visitas`}
            onMouseEnter={() => setElegido(i)}
            onFocus={() => setElegido(i)}
            onBlur={() => setElegido(null)}
            className="group flex h-full flex-1 items-end focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <span
              className={`block w-full rounded-t-sm transition-opacity ${d.total === 0 ? 'bg-borde' : 'bg-titulo'} ${elegido !== null && elegido !== i ? 'opacity-40' : ''}`}
              style={{ height: d.total === 0 ? '2px' : `${Math.max(4, (d.total / maximo) * 100)}%` }}
            />
          </button>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-texto-suave">
        <span>{DIA.format(new Date(datos[0].fecha))}</span>
        <span>{DIA.format(new Date(datos[datos.length - 1].fecha))}</span>
      </div>

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer font-semibold text-titulo">Ver como tabla</summary>
        <div className="mt-3 max-h-64 overflow-y-auto">
          <table className="w-full text-left">
            <thead className="text-texto-suave">
              <tr>
                <th scope="col" className="py-1 font-semibold">Día</th>
                <th scope="col" className="py-1 text-right font-semibold">Visitas</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((d) => (
                <tr key={d.fecha} className="border-t border-borde">
                  <td className="py-1 text-texto">{DIA.format(new Date(d.fecha))}</td>
                  <td className="py-1 text-right tabular-nums text-texto">{d.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  )
}

/** Visitas por hora del día: muestra a qué hora consulta la gente el portal (24 columnas, de 0 a 23 h). */
function VisitasPorHora({ datos }: { datos: Datos['visitas']['por_hora'] }) {
  const [elegida, setElegida] = useState<number | null>(null)
  const maximo = Math.max(1, ...datos.map((d) => d.total))
  const pico = datos.reduce((a, b) => (b.total > a.total ? b : a), datos[0])
  const actual = elegida !== null ? datos[elegida] : null
  const hora = (h: number) => `${String(h).padStart(2, '0')}:00`

  return (
    <section aria-label="Visitas por hora del día" className={TARJETA}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg text-titulo">Visitas por hora del día</h2>
        <p className="text-sm text-texto-suave" aria-live="polite">
          {actual
            ? `${hora(actual.hora)} a ${hora((actual.hora + 1) % 24)}: ${NUMERO.format(actual.total)} visitas`
            : pico.total > 0
              ? `Más visitas a las ${hora(pico.hora)}`
              : 'Todavía no hay visitas en este periodo'}
        </p>
      </div>
      <div className="mt-5 flex h-40 items-end gap-1 border-b border-borde" onMouseLeave={() => setElegida(null)}>
        {datos.map((d, i) => (
          <button
            key={d.hora}
            type="button"
            aria-label={`${hora(d.hora)}: ${d.total} visitas`}
            onMouseEnter={() => setElegida(i)}
            onFocus={() => setElegida(i)}
            onBlur={() => setElegida(null)}
            className="flex h-full flex-1 items-end focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <span
              className={`block w-full rounded-t-sm transition-opacity ${d.total === 0 ? 'bg-borde' : d.hora === pico.hora ? 'bg-primario' : 'bg-titulo'} ${elegida !== null && elegida !== i ? 'opacity-40' : ''}`}
              style={{ height: d.total === 0 ? '2px' : `${Math.max(4, (d.total / maximo) * 100)}%` }}
            />
          </button>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-texto-suave">
        {[0, 6, 12, 18, 23].map((h) => (
          <span key={h}>{hora(h)}</span>
        ))}
      </div>
    </section>
  )
}

function Rejilla({ children }: { children: ReactNode }) {
  return <dl className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">{children}</dl>
}

export function Estadisticas() {
  const [dias, setDias] = useState<Periodo>(30)
  const { data, isPending, isError, refetch, isFetching } = useEstadisticas(dias)

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-x-6">
        <TituloPagina titulo="Estadísticas" subtitulo="Visitas al portal, ingresos al panel y lo que más se usa." />
        <div role="group" aria-label="Periodo" className="mb-6 inline-flex rounded-tema border border-borde p-1">
          {PERIODOS.map((p) => (
            <button
              key={p.dias}
              type="button"
              aria-pressed={dias === p.dias}
              onClick={() => setDias(p.dias)}
              className={`rounded-tema px-3.5 py-1.5 text-sm font-semibold transition-colors ${dias === p.dias ? 'bg-primario text-sobre-primario' : 'text-titulo hover:text-acento'}`}
            >
              {p.texto}
            </button>
          ))}
        </div>
      </div>

      {isPending && <EstadoCarga />}

      {isError && (
        <div className="space-y-4 py-8 text-center">
          <MensajeError texto="No se pudieron cargar las estadísticas. Revise su conexión e intente de nuevo." />
          <Boton type="button" variante="borde" onClick={() => refetch()} className="text-sm">
            Reintentar
          </Boton>
        </div>
      )}

      {data && (
        <div className={`space-y-6 transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
          <Rejilla>
            <Cifra valor={data.visitas.total_periodo} etiqueta={`Visitas en ${data.periodo.dias} días`} />
            <Cifra valor={data.visitas.total_historico} etiqueta="Visitas desde el inicio" />
            <Cifra valor={data.ingresos.correctos} etiqueta="Ingresos al panel" />
            <Cifra valor={data.ingresos.fallidos} etiqueta="Ingresos fallidos" destino="/gestion/bitacora" />
          </Rejilla>

          <VisitasPorDia datos={data.visitas.por_dia} />

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <VisitasPorHora datos={data.visitas.por_hora} />
            </div>
            <Ranking
              titulo="Dispositivos del personal"
              filas={data.dispositivos.map((d) => ({ nombre: d.dispositivo, total: d.total }))}
              vacio="Nadie ingresó al panel en este periodo."
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Ranking
              titulo="Páginas más visitadas"
              filas={data.visitas.paginas.map((p) => ({ nombre: nombrePagina(p.pagina), total: p.total }))}
              vacio="Todavía no hay visitas en este periodo."
            />
            <Ranking
              titulo="Secciones más usadas"
              filas={data.secciones.map((s) => ({ nombre: s.seccion, total: s.total }))}
              vacio="Todavía no hay accesos registrados en este periodo."
            />
            <Ranking
              titulo="Personal más activo"
              filas={data.personal.map((p) => ({ nombre: p.nombre, total: p.total }))}
              vacio="Nadie hizo cambios en este periodo."
            />
            <Ranking
              titulo="Cambios del personal"
              filas={data.acciones.map((a) => ({ nombre: nombreAccion(a.accion), total: a.total }))}
              vacio="Nadie hizo cambios en este periodo."
            />
          </div>

          <section aria-labelledby="titulo-contenido">
            <h2 id="titulo-contenido" className="mb-3 text-lg text-titulo">
              Contenido del portal hoy
            </h2>
            <Rejilla>
              <Cifra valor={data.contenido.mensajes_pendientes} etiqueta="Mensajes por atender" destino="/gestion/mensajes" />
              <Cifra valor={data.contenido.solicitudes_innova_pendientes} etiqueta="Solicitudes a INNOVA pendientes" destino="/gestion/solicitudes-innova" />
              <Cifra valor={data.contenido.noticias_publicadas} etiqueta="Noticias publicadas" destino="/gestion/noticias" />
              <Cifra valor={data.contenido.eventos_proximos} etiqueta="Eventos próximos" destino="/gestion/eventos" />
              <Cifra valor={data.contenido.documentos_publicados} etiqueta="Documentos publicados" destino="/gestion/documentos" />
              <Cifra valor={data.contenido.graduados} etiqueta="Graduados registrados" destino="/gestion/graduados" />
              <Cifra valor={data.contenido.usuarios_activos} etiqueta="Cuentas activas" destino="/gestion/usuarios" />
            </Rejilla>
          </section>
        </div>
      )}
    </div>
  )
}
