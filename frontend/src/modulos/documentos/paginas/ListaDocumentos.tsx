import { useMemo, useState } from 'react'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { EstadoCarga, MensajeError } from '@/compartido/ui/EstadoCarga'
import { IconoBuscar } from '@/compartido/ui/Iconos'
import { useDocumentos } from '../hooks/useDocumentos'
import { TarjetaDocumento } from '../componentes/TarjetaDocumento'

/** CU-05: Consultar documentos públicos de la carrera. */
export function ListaDocumentos() {
  const { data: documentos, isLoading, isError } = useDocumentos()
  const [busqueda, setBusqueda] = useState('')

  const documentosFiltrados = useMemo(() => {
    if (!documentos) return []
    const termino = busqueda.trim().toLowerCase()
    if (!termino) return documentos
    return documentos.filter((doc) =>
      doc.titulo.toLowerCase().includes(termino)
    )
  }, [documentos, busqueda])

  return (
    <div className="mx-auto max-w-6xl">
      <TituloPagina
        titulo="Documentos de la Carrera"
        subtitulo="Consulte y descargue reglamentos, guías, formularios y documentos institucionales."
      />

      {/* Barra de búsqueda */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-texto-suave"
            aria-hidden="true"
          >
            <IconoBuscar />
          </div>
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por título..."
            aria-label="Buscar documentos por título"
            className="w-full rounded-tema border border-borde bg-tarjeta py-2.5 pl-10 pr-4 text-texto placeholder:text-texto-suave focus:border-acento focus:outline-none focus:ring-1 focus:ring-acento"
          />
        </div>
      </div>

      {/* Estado de carga */}
      {isLoading && <EstadoCarga texto="Cargando documentos..." />}

      {/* Estado de error */}
      {isError && (
        <MensajeError texto="No se pudieron cargar los documentos. Por favor, intente más tarde." />
      )}

      {/* Lista de documentos */}
      {!isLoading && !isError && (
        <>
          {documentosFiltrados.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {documentosFiltrados.map((doc) => (
                <TarjetaDocumento key={doc.id} documento={doc} />
              ))}
            </div>
          ) : (
            <div className="rounded-tema border border-borde bg-tarjeta py-12 text-center text-texto-suave">
              {busqueda.trim() ? (
                <p>
                  No se encontraron documentos que coincidan con &ldquo;
                  <span className="font-semibold text-texto">{busqueda.trim()}</span>
                  &rdquo;.
                </p>
              ) : (
                <p>No hay documentos disponibles en este momento.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
