import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { usePermiso } from '@/compartido/sesion/usePermiso'
import { Boton } from '@/compartido/ui/Boton'
import { CLASE_ENTRADA } from '@/compartido/ui/Campo'
import { EstadoCarga, MensajeError } from '@/compartido/ui/EstadoCarga'
import { IconoBuscar } from '@/compartido/ui/Iconos'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { FilaSolicitud } from '../componentes/FilaSolicitud'
import { normalizar } from '../formato'
import { ESTADOS, type EstadoSolicitud } from '../tipos'
import { useSolicitudes } from '../useInnova'

type Filtro = EstadoSolicitud | 'todas'

/** CU-23 Atender solicitudes de INNOVA. */
export function GestionSolicitudes() {
  const { data: solicitudes, isPending, isError, refetch } = useSolicitudes()
  const veInnova = usePermiso('empresa_junior.ver')
  const [filtro, setFiltro] = useState<Filtro>('todas')
  const [busqueda, setBusqueda] = useState('')

  const cantidad = useMemo(() => {
    const cuenta: Record<string, number> = { todas: solicitudes?.length ?? 0 }
    for (const s of solicitudes ?? []) cuenta[s.estado] = (cuenta[s.estado] ?? 0) + 1
    return cuenta
  }, [solicitudes])

  const visibles = useMemo(() => {
    const buscado = normalizar(busqueda.trim())
    return (solicitudes ?? []).filter(
      (s) =>
        (filtro === 'todas' || s.estado === filtro) &&
        (!buscado || normalizar(`${s.nombre} ${s.organizacion ?? ''} ${s.correo} ${s.servicio ?? ''}`).includes(buscado)),
    )
  }, [solicitudes, filtro, busqueda])

  const opciones: [Filtro, string][] = [['todas', 'Todas'], ...(Object.entries(ESTADOS) as [EstadoSolicitud, string][])]

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-x-6">
        <TituloPagina
          titulo="Solicitudes a INNOVA"
          subtitulo="Pedidos de servicio que envían emprendedores y organizaciones desde la página de INNOVA."
        />
        {veInnova && (
          <Link
            to="/gestion/empresa-junior"
            className="mb-6 inline-flex items-center rounded-tema border border-borde px-4 py-2 text-sm font-semibold text-titulo transition-colors hover:border-titulo"
          >
            Editar la página de INNOVA
          </Link>
        )}
      </div>

      {isPending && <EstadoCarga />}

      {isError && (
        <div className="space-y-4 text-center">
          <MensajeError />
          <Boton variante="borde" onClick={() => refetch()}>
            Reintentar
          </Boton>
        </div>
      )}

      {solicitudes && solicitudes.length === 0 && (
        <div className="rounded-tema border border-borde-tarjeta bg-tarjeta px-6 py-12 text-center sombra-suave">
          <p className="font-semibold text-titulo">Todavía no hay solicitudes.</p>
          <p className="mt-1 text-texto-suave">Las que envíen los visitantes desde la página de INNOVA aparecerán aquí.</p>
        </div>
      )}

      {solicitudes && solicitudes.length > 0 && (
        <>
          <div role="group" aria-label="Filtrar por estado" className="flex flex-wrap gap-2">
            {opciones.map(([valor, nombre]) => (
              <button
                key={valor}
                type="button"
                aria-pressed={filtro === valor}
                onClick={() => setFiltro(valor)}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                  filtro === valor ? 'border-marino bg-marino text-sobre-primario' : 'border-borde text-titulo hover:border-titulo'
                }`}
              >
                {nombre} <span className="font-normal">({cantidad[valor] ?? 0})</span>
              </button>
            ))}
          </div>

          <label className="relative mt-4 block">
            <span className="sr-only">Buscar solicitudes</span>
            <IconoBuscar className="pointer-events-none absolute left-3 top-1/2 mt-0.5 -translate-y-1/2 text-texto-suave" width={18} height={18} />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, organización, correo o servicio"
              className={`${CLASE_ENTRADA} pl-10`}
            />
          </label>

          <p className="mt-6 text-sm text-texto-suave" aria-live="polite">
            {visibles.length === solicitudes.length
              ? `${solicitudes.length} ${solicitudes.length === 1 ? 'solicitud' : 'solicitudes'}`
              : `${visibles.length} de ${solicitudes.length} solicitudes`}
          </p>

          {visibles.length > 0 ? (
            <ul className="space-y-3">
              {visibles.map((solicitud) => (
                <FilaSolicitud key={solicitud.id} solicitud={solicitud} />
              ))}
            </ul>
          ) : (
            <p className="py-10 text-center text-texto-suave">Ninguna solicitud coincide con el filtro.</p>
          )}
        </>
      )}
    </div>
  )
}
