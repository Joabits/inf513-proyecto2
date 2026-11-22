import { useMemo, useState } from 'react'
import { Boton } from '@/compartido/ui/Boton'
import { EstadoCarga, MensajeError } from '@/compartido/ui/EstadoCarga'
import { IconoBuscar } from '@/compartido/ui/Iconos'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { TarjetaDocumento } from '../componentes/TarjetaDocumento'
import { nombreFormato } from '../formato'
import { useDocumentos } from '../hooks/useDocumentos'
import type { Documento } from '../tipos/index'

/** Sin tildes ni mayúsculas: «titulacion» encuentra «Titulación», igual que el buscador de la cabecera. */
const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

const nombreCategoria = (doc: Documento) => (typeof doc.categoria === 'object' && doc.categoria !== null ? doc.categoria.nombre : doc.categoria)

/**
 * Página pública «Documentos de la Carrera» (CU-05). Se filtra en el navegador: la API entrega todos los
 * documentos publicados (son decenas), así filtrar y buscar no vuelve a pedir nada al servidor.
 */
export function ListaDocumentos() {
  const { data: documentos, isPending, isError, refetch } = useDocumentos()
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('')

  // Categorías que tienen documentos publicados, en orden alfabético
  const categorias = useMemo(
    () => [...new Set((documentos ?? []).map(nombreCategoria).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es')),
    [documentos],
  )

  const visibles = useMemo(() => {
    const terminos = normalizar(busqueda).split(/\s+/).filter(Boolean)
    return (documentos ?? []).filter((doc) => {
      if (categoria && nombreCategoria(doc) !== categoria) return false
      // Cada palabra escrita debe aparecer en el título, la descripción, la categoría o el formato («formulario word»)
      const texto = normalizar(`${doc.titulo} ${doc.descripcion ?? ''} ${nombreCategoria(doc)} ${nombreFormato(doc.tipo) ?? ''}`)
      return terminos.every((t) => texto.includes(t))
    })
  }, [documentos, busqueda, categoria])

  const hayFiltros = busqueda.trim() !== '' || categoria !== ''

  return (
    <div className="mx-auto max-w-6xl">
      <TituloPagina titulo="Documentos de la Carrera" subtitulo="Consulte y descargue reglamentos, guías, formularios y documentos institucionales." />

      {isPending && <EstadoCarga texto="Cargando documentos..." />}

      {isError && (
        <div className="mx-auto max-w-xl space-y-4 py-10 text-center">
          <MensajeError texto="No se pudieron cargar los documentos." />
          <Boton variante="borde" onClick={() => refetch()}>
            Reintentar
          </Boton>
        </div>
      )}

      {documentos && documentos.length === 0 && (
        <p className="rounded-tema bg-superficie p-10 text-center text-texto-suave">Todavía no hay documentos publicados.</p>
      )}

      {documentos && documentos.length > 0 && (
        <>
          <div className="space-y-4">
            <label className="relative block max-w-md">
              <span className="sr-only">Buscar documentos</span>
              <IconoBuscar width={18} height={18} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-texto-suave" />
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                maxLength={100}
                placeholder="Buscar por título, descripción o categoría"
                className="w-full rounded-tema border border-borde bg-tarjeta py-2.5 pl-10 pr-4 text-texto placeholder:text-texto-suave focus:border-primario focus:outline-none focus-visible:ring-2 focus-visible:ring-primario/40"
              />
            </label>

            {categorias.length > 1 && (
              <div role="group" aria-label="Filtrar por categoría" className="flex flex-wrap gap-2">
                {['', ...categorias].map((nombre) => {
                  const activa = categoria === nombre
                  return (
                    <button
                      key={nombre || 'todas'}
                      type="button"
                      aria-pressed={activa}
                      onClick={() => setCategoria(nombre)}
                      className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario ${
                        activa ? 'border-primario bg-primario text-sobre-primario' : 'border-borde bg-tarjeta text-titulo hover:border-primario'
                      }`}
                    >
                      {nombre || 'Todas'}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="mt-6 flex min-h-8 flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-texto-suave" aria-live="polite">
              {visibles.length === 1 ? '1 documento' : `${visibles.length} documentos`}
              {categoria && ` en ${categoria}`}
            </p>
            {hayFiltros && (
              <button
                type="button"
                onClick={() => {
                  setBusqueda('')
                  setCategoria('')
                }}
                className="text-sm font-semibold text-acento hover:underline"
              >
                Quitar filtros
              </button>
            )}
          </div>

          {visibles.length > 0 ? (
            <ul className="mt-4 grid gap-6 md:grid-cols-2">
              {visibles.map((doc) => (
                <li key={doc.id}>
                  <TarjetaDocumento documento={doc} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-tema bg-superficie p-10 text-center text-texto-suave">Ningún documento coincide con la búsqueda.</p>
          )}
        </>
      )}
    </div>
  )
}
