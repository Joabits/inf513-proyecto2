import { useMemo } from 'react'
import { Boton } from '@/compartido/ui/Boton'
import { EstadoCarga, MensajeError } from '@/compartido/ui/EstadoCarga'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { TarjetaEvento } from '../componentes/TarjetaEvento'
import { useEventos } from '../hooks/useEventos'
import type { Evento } from '../tipos'

const instante = (iso?: string) => (iso ? new Date(iso).getTime() : 0)

/**
 * Separa lo que todavía se puede asistir de lo que ya pasó. Un evento sigue en «próximos» hasta que termina
 * (uno de varios días se ve hasta su último día). Próximos: del más cercano al más lejano. Realizados: del más reciente.
 */
function separar(eventos: Evento[], ahora: number) {
  const proximos = eventos.filter((e) => instante(e.fecha_fin_iso) >= ahora).sort((a, b) => instante(a.fecha_inicio_iso) - instante(b.fecha_inicio_iso))
  const realizados = eventos.filter((e) => instante(e.fecha_fin_iso) < ahora).sort((a, b) => instante(b.fecha_inicio_iso) - instante(a.fecha_inicio_iso))
  return { proximos, realizados }
}

/** Página pública «Eventos académicos» (CU-01). */
export function ListaEventos() {
  const { data: eventos, isPending, isError, refetch, dataUpdatedAt } = useEventos(true)
  // «Ahora» es el momento en que llegaron los datos: no hay temporizadores, y al volver a consultar se recalcula
  const { proximos, realizados } = useMemo(() => separar(eventos ?? [], dataUpdatedAt), [eventos, dataUpdatedAt])

  return (
    <div className="mx-auto max-w-6xl">
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
          <section aria-labelledby="titulo-proximos">
            <h2 id="titulo-proximos" className="text-2xl text-titulo">
              Próximos eventos
            </h2>
            {proximos.length > 0 ? (
              <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {proximos.map((evento) => (
                  <li key={evento.id}>
                    <TarjetaEvento evento={evento} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-6 rounded-tema bg-superficie p-10 text-center text-texto-suave">No hay eventos programados por ahora.</p>
            )}
          </section>

          {realizados.length > 0 && (
            <section aria-labelledby="titulo-realizados" className="mt-16 md:mt-20">
              <h2 id="titulo-realizados" className="text-2xl text-titulo">
                Eventos realizados
              </h2>
              <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {realizados.map((evento) => (
                  <li key={evento.id}>
                    <TarjetaEvento evento={evento} realizado />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  )
}
