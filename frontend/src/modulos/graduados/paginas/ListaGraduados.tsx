import { useMemo, useState } from 'react'
import { Boton } from '@/compartido/ui/Boton'
import { CLASE_ENTRADA } from '@/compartido/ui/Campo'
import { EstadoCarga, MensajeError } from '@/compartido/ui/EstadoCarga'
import { IconoBuscar, IconoGraduacion } from '@/compartido/ui/Iconos'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { useGraduadosPublicos } from '../hooks/useGraduados'

const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

export function ListaGraduados() {
  const { data: graduados, isPending, isError, refetch } = useGraduadosPublicos()
  const [busqueda, setBusqueda] = useState('')

  const graduadosFiltrados = useMemo(() => {
    const buscado = normalizar(busqueda.trim())
    return (graduados ?? []).filter((g) => {
      if (!buscado) return true
      return (
        normalizar(g.nombre_completo).includes(buscado) ||
        normalizar(g.gestion_egreso).includes(buscado) ||
        normalizar(g.modalidad).includes(buscado) ||
        (g.titulo_tema && normalizar(g.titulo_tema).includes(buscado))
      )
    })
  }, [graduados, busqueda])

  return (
    <div className="mx-auto max-w-6xl">
      <TituloPagina
        titulo="Directorio de Graduados"
        subtitulo="Registro y consulta académica de los profesionales titulados de la carrera."
      />

      <div className="mb-8 flex flex-wrap items-center gap-4">
        <div className="relative min-w-[280px] max-w-md flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-texto-suave">
            <IconoBuscar width={18} height={18} />
          </span>
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, gestión, modalidad o tema..."
            className={`${CLASE_ENTRADA} !mt-0 pl-10`}
          />
        </div>
      </div>

      {isPending && <EstadoCarga />}

      {isError && (
        <div className="space-y-4 py-8 text-center">
          <MensajeError texto="No se pudo cargar la lista de graduados. Intente nuevamente." />
          <Boton type="button" variante="borde" onClick={() => refetch()} className="text-sm">
            Reintentar
          </Boton>
        </div>
      )}

      {graduados && (
        <>
          {graduados.length === 0 ? (
            <div className="rounded-tema border border-borde-tarjeta bg-tarjeta p-12 text-center text-texto-suave sombra-suave">
              <IconoGraduacion className="mx-auto mb-3 h-12 w-12 text-texto-suave/50" />
              <p className="text-base font-medium">No hay graduados registrados aún.</p>
            </div>
          ) : graduadosFiltrados.length === 0 ? (
            <div className="rounded-tema border border-borde-tarjeta bg-tarjeta p-12 text-center text-texto-suave sombra-suave">
              <p className="text-base">No se encontraron graduados que coincidan con la búsqueda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {graduadosFiltrados.map((g) => (
                <div
                  key={g.id}
                  className="flex flex-col justify-between rounded-tema border border-borde-tarjeta bg-tarjeta p-6 sombra-suave transition-all hover:sombra-media"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 border-b border-borde-tarjeta/60 pb-3">
                      <span className="inline-flex rounded-full border border-borde bg-superficie px-2.5 py-0.5 text-xs font-semibold text-titulo">
                        {g.modalidad}
                      </span>
                      <span className="text-xs font-medium text-texto-suave">
                        Egreso: {g.gestion_egreso}
                      </span>
                    </div>

                    <h3 className="mt-4 text-base font-bold text-titulo">
                      {g.nombre_completo}
                    </h3>

                    {g.titulo_tema && (
                      <div className="mt-3 rounded-tema bg-superficie/50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-texto-suave">
                          Título / Tema
                        </p>
                        <p className="mt-1 text-sm font-medium text-texto line-clamp-3">
                          {g.titulo_tema}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-borde-tarjeta/60 pt-3 text-xs text-texto-suave">
                    <span>Ingreso: {g.gestion_ingreso}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
