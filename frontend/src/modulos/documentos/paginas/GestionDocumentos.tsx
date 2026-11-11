import { useMemo, useState } from 'react'
import { usePermiso } from '@/compartido/sesion/usePermiso'
import { Boton } from '@/compartido/ui/Boton'
import { CLASE_ENTRADA } from '@/compartido/ui/Campo'
import { EstadoCarga, MensajeError } from '@/compartido/ui/EstadoCarga'
import { IconoAgregar, IconoBuscar } from '@/compartido/ui/Iconos'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { FilaDocumento } from '../componentes/FilaDocumento'
import { FormDocumento } from '../componentes/FormDocumento'
import { useDocumentos } from '../useDocumentos'

const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

export function GestionDocumentos() {
  const { data: documentos, isPending, isError, refetch } = useDocumentos()
  const puedeCrear = usePermiso('documentos.crear')
  const [subiendo, setSubiendo] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('')

  const categorias = useMemo(
    () => [...new Set(documentos?.map((documento) => documento.categoria))].sort((a, b) => a.localeCompare(b, 'es')),
    [documentos],
  )

  const visibles = useMemo(() => {
    const buscado = normalizar(busqueda.trim())
    return (documentos ?? []).filter(
      (documento) =>
        (!categoria || documento.categoria === categoria) &&
        (!buscado || normalizar(`${documento.titulo} ${documento.descripcion ?? ''}`).includes(buscado)),
    )
  }, [documentos, busqueda, categoria])

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-x-6">
        <TituloPagina titulo="Documentos" subtitulo="Reglamentos, formularios y demás archivos que los visitantes pueden descargar." />
        {puedeCrear && !subiendo && (
          <Boton type="button" onClick={() => setSubiendo(true)} className="mb-6 inline-flex items-center gap-2">
            <IconoAgregar width={18} height={18} /> Subir documento
          </Boton>
        )}
      </div>

      {subiendo && (
        <section aria-labelledby="titulo-subir" className="mb-10 rounded-tema border border-borde bg-fondo p-5 md:p-6">
          <h2 id="titulo-subir" className="mb-5 text-xl text-titulo">
            Subir documento
          </h2>
          <FormDocumento categorias={categorias} alTerminar={() => setSubiendo(false)} />
        </section>
      )}

      {isPending && <EstadoCarga />}

      {isError && (
        <div className="space-y-4 text-center">
          <MensajeError />
          <Boton variante="borde" onClick={() => refetch()}>
            Reintentar
          </Boton>
        </div>
      )}

      {documentos && documentos.length === 0 && !subiendo && (
        <div className="rounded-tema border border-dashed border-borde px-6 py-12 text-center">
          <p className="font-semibold text-titulo">Todavía no hay documentos.</p>
          <p className="mt-1 text-texto-suave">Los que suba aparecerán aquí y en la sección Documentos del portal.</p>
        </div>
      )}

      {documentos && documentos.length > 0 && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Buscar documentos</span>
              <IconoBuscar className="pointer-events-none absolute left-3 top-1/2 mt-0.5 -translate-y-1/2 text-texto-suave" width={18} height={18} />
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por título o descripción"
                className={`${CLASE_ENTRADA} pl-10`}
              />
            </label>
            <label className="sm:w-60">
              <span className="sr-only">Filtrar por categoría</span>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={CLASE_ENTRADA}>
                <option value="">Todas las categorías</option>
                {categorias.map((nombre) => (
                  <option key={nombre} value={nombre}>
                    {nombre}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <p className="mt-6 text-sm text-texto-suave" aria-live="polite">
            {visibles.length === documentos.length
              ? `${documentos.length} ${documentos.length === 1 ? 'documento' : 'documentos'}`
              : `${visibles.length} de ${documentos.length} documentos`}
          </p>

          {visibles.length > 0 ? (
            <ul className="divide-y divide-borde border-y border-borde">
              {visibles.map((documento) => (
                <FilaDocumento key={documento.id} documento={documento} categorias={categorias} />
              ))}
            </ul>
          ) : (
            <p className="py-10 text-center text-texto-suave">Ningún documento coincide con la búsqueda.</p>
          )}
        </>
      )}
    </div>
  )
}
