import { useState } from 'react'
import { RUTA_BASE } from '@/compartido/api/cliente'
import { usePermiso } from '@/compartido/sesion/usePermiso'
import { Boton } from '@/compartido/ui/Boton'
import { BotonConfirmar } from '@/compartido/ui/BotonConfirmar'
import { EstadoCarga, MensajeError } from '@/compartido/ui/EstadoCarga'
import { IconoAgregar, IconoEditar, IconoEliminar } from '@/compartido/ui/Iconos'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { FormularioGaleria } from '../componentes/FormularioGaleria'
import { useEliminarGaleria, useGaleria } from '../hooks/useGaleria'
import type { Galeria } from '../tipos'

export function GestionGaleria() {
  const { data: items, isPending, isError } = useGaleria()
  const eliminar = useEliminarGaleria()

  const puedeCrear = usePermiso('galeria.crear')
  const puedeEditar = usePermiso('galeria.editar')
  const puedeEliminar = usePermiso('galeria.eliminar')

  const [modalAbierto, setModalAbierto] = useState(false)
  const [itemEnEdicion, setItemEnEdicion] = useState<Galeria | null>(null)

  const abrirCreacion = () => {
    setItemEnEdicion(null)
    setModalAbierto(true)
  }

  const abrirEdicion = (item: Galeria) => {
    setItemEnEdicion(item)
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setItemEnEdicion(null)
    setModalAbierto(false)
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-x-6">
        <TituloPagina
          titulo="Gestión de Galería Multimedia"
          subtitulo="Administra las imágenes y fotografías que se muestran en el portal."
        />
        {puedeCrear && (
          <Boton
            type="button"
            variante="primario"
            onClick={abrirCreacion}
            className="mb-6 inline-flex items-center gap-2"
          >
            <IconoAgregar width={18} height={18} /> Subir imagen
          </Boton>
        )}
      </div>

      {isPending && <EstadoCarga />}

      {isError && (
        <MensajeError texto="No se pudo cargar la lista de imágenes. Intente nuevamente." />
      )}

      {!isPending && !isError && items && items.length === 0 && (
        <div className="rounded-tema border border-borde bg-fondo p-10 text-center">
          <p className="text-texto">No hay imágenes registradas en la galería.</p>
          {puedeCrear && (
            <Boton
              type="button"
              variante="primario"
              onClick={abrirCreacion}
              className="mt-4 inline-flex items-center gap-2"
            >
              <IconoAgregar width={18} height={18} /> Subir la primera imagen
            </Boton>
          )}
        </div>
      )}

      {!isPending && !isError && items && items.length > 0 && (
        <div className="overflow-x-auto rounded-tema border border-borde bg-fondo">
          <table className="w-full text-left text-sm text-texto">
            <thead className="border-b border-borde bg-marino-oscuro/5 text-xs uppercase font-semibold text-titulo">
              <tr>
                <th className="px-4 py-3">Miniatura</th>
                <th className="px-4 py-3">Título y Descripción</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borde">
              {items.map((item) => {
                const url =
                  item.imagen.startsWith('http://') ||
                  item.imagen.startsWith('https://') ||
                  !RUTA_BASE
                    ? item.imagen
                    : `${RUTA_BASE}${item.imagen}`

                return (
                  <tr key={item.id} className="hover:bg-marino-oscuro/5">
                    {/* Miniatura */}
                    <td className="px-4 py-3">
                      <div className="h-14 w-20 overflow-hidden rounded-tema border border-borde bg-marino-oscuro/5">
                        <img
                          src={url}
                          alt={item.titulo || 'Miniatura'}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </td>

                    {/* Título y Descripción */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-titulo">
                        {item.titulo || <span className="italic text-texto font-normal">Sin título</span>}
                      </div>
                      {item.descripcion && (
                        <p className="line-clamp-2 mt-0.5 text-xs text-texto">
                          {item.descripcion}
                        </p>
                      )}
                      {item.autor && (
                        <p className="mt-1 text-xs text-texto-suave">
                          Por: {item.autor}
                        </p>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-3 text-center">
                      {item.publicado ? (
                        <span className="inline-block rounded-tema bg-primario/10 px-2.5 py-1 text-xs font-semibold text-primario">
                          Publicado
                        </span>
                      ) : (
                        <span className="inline-block rounded-tema bg-marino/10 px-2.5 py-1 text-xs font-semibold text-marino">
                          Borrador
                        </span>
                      )}
                    </td>

                    {/* Fecha */}
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-texto">
                      {item.creado_en}
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {puedeEditar && (
                          <Boton
                            type="button"
                            variante="borde"
                            onClick={() => abrirEdicion(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
                            title="Editar imagen"
                          >
                            <IconoEditar width={14} height={14} /> Editar
                          </Boton>
                        )}

                        {puedeEliminar && (
                          <BotonConfirmar
                            pregunta="¿Eliminar imagen?"
                            confirmar="Sí, eliminar"
                            ocupado={eliminar.isPending}
                            alConfirmar={() => eliminar.mutate(item.id)}
                          >
                            <IconoEliminar width={14} height={14} /> Eliminar
                          </BotonConfirmar>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal con FormularioGaleria */}
      {modalAbierto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-form-titulo"
          className="fixed inset-0 z-50 flex items-center justify-center bg-marino-oscuro/80 p-4 backdrop-blur-sm"
          onClick={cerrarModal}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-tema border border-borde bg-fondo p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-borde pb-3">
              <h2 id="modal-form-titulo" className="text-xl font-bold text-titulo">
                {itemEnEdicion ? 'Editar imagen' : 'Subir nueva imagen a la galería'}
              </h2>
              <button
                type="button"
                onClick={cerrarModal}
                className="grid h-8 w-8 place-items-center rounded-tema border border-borde bg-fondo text-texto hover:border-acento hover:text-acento"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            <FormularioGaleria
              galeria={itemEnEdicion}
              alGuardar={cerrarModal}
              alCancelar={cerrarModal}
            />
          </div>
        </div>
      )}
    </div>
  )
}
