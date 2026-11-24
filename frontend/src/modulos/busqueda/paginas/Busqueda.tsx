import { isAxiosError } from 'axios'
import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import { Boton } from '@/compartido/ui/Boton'
import { CLASE_CAJA } from '@/compartido/ui/Campo'
import { EstadoCarga, MensajeError } from '@/compartido/ui/EstadoCarga'
import { IconoBuscar, IconoCerrar } from '@/compartido/ui/Iconos'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { ResultadoBusqueda } from '../componentes/ResultadoBusqueda'
import { terminosDe } from '../resaltar'
import type { GrupoBusqueda } from '../tipos'
import { MAXIMO, MINIMO, useBusqueda } from '../useBusqueda'

/** «14 resultados» en Todos; «12 resultados en Materias» con una pestaña elegida. */
function contador(total: number, grupo?: GrupoBusqueda) {
  const cantidad = grupo?.total ?? total
  const texto = `${cantidad} ${cantidad === 1 ? 'resultado' : 'resultados'}`
  return grupo ? `${texto} en ${grupo.etiqueta}` : texto
}

const PESTANA =
  'rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors aria-pressed:border-titulo aria-pressed:bg-titulo aria-pressed:text-fondo'

/**
 * Resultados del buscador del portal (CU-07). La consulta y el tipo elegido viven en la URL
 * (/buscar?q=reglamento&tipo=documento): el buscador de la cabecera llega aquí y el enlace se puede compartir.
 */
export function Busqueda() {
  const [parametros, setParametros] = useSearchParams()
  const q = parametros.get('q') ?? ''
  const tipo = parametros.get('tipo')
  const [texto, setTexto] = useState(q)
  const [anterior, setAnterior] = useState(q)
  const { data, isPending, isFetching, isError, error, refetch } = useBusqueda(q, tipo)

  // Si la consulta cambia desde la cabecera, el campo la refleja
  if (q !== anterior) {
    setAnterior(q)
    setTexto(q)
  }

  const consulta = q.trim()
  const terminos = terminosDe(consulta)
  const corta = consulta.length > 0 && consulta.length < MINIMO
  const limitada = isAxiosError(error) && error.response?.status === 429

  function enviar(e: FormEvent) {
    e.preventDefault()
    const nuevo = texto.trim()
    setParametros(nuevo ? { q: nuevo } : {})
  }

  function elegirTipo(nuevo: string | null) {
    setParametros(nuevo ? { q: consulta, tipo: nuevo } : { q: consulta }, { replace: true, preventScrollReset: true })
  }

  return (
    <div className="mx-auto max-w-6xl">
      <TituloPagina titulo="Buscar en el portal" subtitulo="Noticias, eventos, galería, documentos, materias, investigación, revista INNOVAR, autoridades y docentes." />

      <form onSubmit={enviar} role="search" className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Qué desea buscar</span>
          <IconoBuscar className="pointer-events-none absolute left-3 top-1/2 mt-0.5 -translate-y-1/2 text-texto-suave" width={18} height={18} />
          <input
            type="search"
            value={texto}
            maxLength={MAXIMO}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Ej. reglamento, contabilidad, emprendimiento"
            className={`${CLASE_CAJA} pl-10 pr-10 [&::-webkit-search-cancel-button]:hidden`}
          />
          {texto && (
            <button
              type="button"
              onClick={() => setTexto('')}
              aria-label="Borrar lo escrito"
              className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-texto-suave hover:bg-superficie hover:text-titulo"
            >
              <IconoCerrar width={16} height={16} />
            </button>
          )}
        </label>
        <Boton type="submit">Buscar</Boton>
      </form>

      <div className="mt-8" aria-live="polite">
        {!consulta && <p className="text-texto-suave">Escriba una o más palabras para buscar en todo el portal.</p>}

        {corta && <p className="text-texto-suave">Escriba al menos {MINIMO} caracteres.</p>}

        {consulta.length >= MINIMO && isPending && <EstadoCarga texto="Buscando..." />}

        {isError && (
          <div className="space-y-4 text-center">
            <MensajeError texto={limitada ? 'Hizo muchas búsquedas seguidas. Espere un minuto e intente de nuevo.' : 'No se pudo completar la búsqueda.'} />
            {!limitada && (
              <Boton variante="borde" onClick={() => refetch()}>
                Reintentar
              </Boton>
            )}
          </div>
        )}

        {data && !corta && consulta.length >= MINIMO && (
          <>
            {data.total === 0 ? (
              <div className="rounded-tema border border-borde-tarjeta bg-tarjeta px-6 py-12 text-center sombra-suave">
                <p className="font-semibold text-titulo">No encontramos resultados para «{data.consulta}».</p>
                <p className="mt-1 text-texto-suave">Revise la ortografía o pruebe con menos palabras o con otras más generales.</p>
              </div>
            ) : (
              <>
                <p className={`text-sm text-texto-suave transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
                  {contador(data.total, data.grupos.find((g) => g.tipo === tipo))} para «{data.consulta}»
                </p>

                <div role="group" aria-label="Filtrar por tipo" className="mt-4 flex flex-wrap gap-2">
                  <button type="button" aria-pressed={!tipo} onClick={() => elegirTipo(null)} className={`${PESTANA} border-borde text-titulo`}>
                    Todos ({data.total})
                  </button>
                  {data.grupos.map((grupo) => (
                    <button
                      key={grupo.tipo}
                      type="button"
                      aria-pressed={tipo === grupo.tipo}
                      onClick={() => elegirTipo(grupo.tipo)}
                      className={`${PESTANA} border-borde text-titulo`}
                    >
                      {grupo.etiqueta} ({grupo.total})
                    </button>
                  ))}
                </div>

                <div className={`transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
                  {data.grupos
                    .filter((grupo) => grupo.resultados.length > 0)
                    .map((grupo) => (
                      <section key={grupo.tipo} aria-labelledby={`grupo-${grupo.tipo}`} className="mt-5">
                        {!tipo && (
                          <h2 id={`grupo-${grupo.tipo}`} className="text-xl text-titulo">
                            {grupo.etiqueta}
                          </h2>
                        )}
                        {/* Línea arriba, entre y debajo de los resultados: igual con uno solo que con varios */}
                        <ul className="mt-2 divide-y divide-borde border-y border-borde">
                          {grupo.resultados.map((resultado) => (
                            <ResultadoBusqueda
                              key={`${resultado.ruta}-${resultado.titulo}`}
                              resultado={resultado}
                              tipo={grupo.tipo}
                              etiqueta={grupo.etiqueta}
                              terminos={terminos}
                            />
                          ))}
                        </ul>
                        {!tipo && grupo.total > grupo.resultados.length && (
                          <button
                            type="button"
                            onClick={() => elegirTipo(grupo.tipo)}
                            className="mt-1 text-sm font-semibold text-acento underline-offset-4 hover:underline"
                          >
                            Ver los {grupo.total} resultados de {grupo.etiqueta.toLowerCase()}
                          </button>
                        )}
                      </section>
                    ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
