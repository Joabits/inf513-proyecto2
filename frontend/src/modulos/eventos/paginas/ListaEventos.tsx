import { useMemo } from 'react'
import { Boton } from '@/compartido/ui/Boton'
import { EstadoCarga, MensajeError } from '@/compartido/ui/EstadoCarga'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { TarjetaEvento } from '../componentes/TarjetaEvento'
import { useEventos } from '../hooks/useEventos'
import type { Evento } from '../tipos'

const instante = (iso?: string) => (iso ? new Date(iso).getTime() : 0)
const MES_Y_ANIO = new Intl.DateTimeFormat('es-BO', { month: 'long', year: 'numeric' })
const mayuscula = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1)

/**
 * Separa lo que todavía se puede asistir de lo que ya pasó. Un evento sigue en «próximos» hasta que termina
 * (uno de varios días se ve hasta su último día). Próximos: del más cercano al más lejano, agrupados por mes.
 * Realizados: del más reciente al más antiguo.
 */
function organizar(eventos: Evento[], ahora: number) {
  const proximos = eventos.filter((e) => instante(e.fecha_fin_iso) >= ahora).sort((a, b) => instante(a.fecha_inicio_iso) - instante(b.fecha_inicio_iso))
  const realizados = eventos.filter((e) => instante(e.fecha_fin_iso) < ahora).sort((a, b) => instante(b.fecha_inicio_iso) - instante(a.fecha_inicio_iso))

  const meses: { clave: string; titulo: string; eventos: Evento[] }[] = []
  for (const evento of proximos) {
    const inicio = new Date(evento.fecha_inicio_iso ?? '')
    const clave = `${inicio.getFullYear()}-${inicio.getMonth()}`
    const mes = meses.find((m) => m.clave === clave)
    if (mes) mes.eventos.push(evento)
    else meses.push({ clave, titulo: mayuscula(MES_Y_ANIO.format(inicio)), eventos: [evento] })
  }

  return { meses, realizados, ahora }
}

const enCurso = (evento: Evento, ahora: number) => instante(evento.fecha_inicio_iso) <= ahora && ahora <= instante(evento.fecha_fin_iso)

/**
 * Página pública «Eventos académicos» (CU-01): una agenda de una sola columna, como en las agendas de otras
 * universidades. Los próximos van agrupados por mes; los ya realizados quedan plegados, porque casi nadie los busca.
 */
export function ListaEventos() {
  const { data: eventos, isPending, isError, refetch, dataUpdatedAt } = useEventos(true)
  // «Ahora» es el momento en que llegaron los datos: no hay temporizadores, y al volver a consultar se recalcula
  const { meses, realizados, ahora } = useMemo(() => organizar(eventos ?? [], dataUpdatedAt), [eventos, dataUpdatedAt])

  return (
    <div className="mx-auto max-w-4xl">
      <TituloPagina titulo="Eventos académicos" subtitulo="Conferencias, seminarios, talleres y actividades de la Carrera." />

      {isPending && <EstadoCarga />}

      {isError && (
        <div className="mx-auto max-w-xl space-y-4 py-10 text-center">
          <MensajeError texto="No se pudieron cargar los eventos." />
          <Boton variante="borde" onClick={() => refetch()}>
            Reintentar
          </Boton>
        </div>
      )}

      {eventos && (
        <>
          {meses.length > 0 ? (
            meses.map((mes) => (
              <section key={mes.clave} aria-labelledby={`mes-${mes.clave}`} className="mb-10">
                <h2 id={`mes-${mes.clave}`} className="border-b border-borde pb-2 text-xl text-titulo">
                  {mes.titulo}
                </h2>
                <ul className="mt-5 space-y-4">
                  {mes.eventos.map((evento) => (
                    <li key={evento.id}>
                      <TarjetaEvento evento={evento} enCurso={enCurso(evento, ahora)} />
                    </li>
                  ))}
                </ul>
              </section>
            ))
          ) : (
            <p className="rounded-tema bg-superficie p-10 text-center text-texto-suave">No hay eventos programados por ahora.</p>
          )}

          {realizados.length > 0 && (
            <details className="group mt-4 rounded-tema border border-borde-tarjeta bg-tarjeta sombra-suave">
              <summary className="cursor-pointer list-none rounded-tema px-5 py-4 font-semibold text-titulo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario">
                Eventos realizados ({realizados.length})
                <span className="ml-2 text-sm font-normal text-texto-suave group-open:hidden">Mostrar</span>
                <span className="ml-2 hidden text-sm font-normal text-texto-suave group-open:inline">Ocultar</span>
              </summary>
              <ul className="space-y-4 px-5 pb-5">
                {realizados.map((evento) => (
                  <li key={evento.id}>
                    <TarjetaEvento evento={evento} realizado />
                  </li>
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </div>
  )
}
