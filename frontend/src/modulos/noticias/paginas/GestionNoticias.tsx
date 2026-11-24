import { useState } from 'react'
import { Plus, Edit2, Trash2, X, Eye } from 'lucide-react'
import { Link } from 'react-router'
import { usePermiso } from '@/compartido/sesion/usePermiso'
import { Boton } from '@/compartido/ui/Boton'
import { BotonConfirmar } from '@/compartido/ui/BotonConfirmar'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { CABECERA_TABLA } from '@/compartido/ui/tabla'
import { useNoticias, useEliminarNoticia } from '../hooks/useNoticias'
import { FormularioNoticia } from '../componentes/FormularioNoticia'
import type { Noticia } from '../tipos'

export function GestionNoticias() {
  const { data: noticias, isLoading, isError } = useNoticias(true)
  const eliminarMutation = useEliminarNoticia()
  const puedeCrear = usePermiso('noticias.crear')
  const puedeEditar = usePermiso('noticias.editar')
  const puedeEliminar = usePermiso('noticias.eliminar')

  const [modalAbierto, setModalAbierto] = useState(false)
  const [noticiaEditando, setNoticiaEditando] = useState<Noticia | undefined>(undefined)

  const abrirModalCrear = () => {
    setNoticiaEditando(undefined)
    setModalAbierto(true)
  }

  const abrirModalEditar = (noticia: Noticia) => {
    setNoticiaEditando(noticia)
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setNoticiaEditando(undefined)
  }

  return (
    <div className="font-montserrat">
      {/* Mismo encabezado que las demás secciones del panel: título con su ícono y el botón a la derecha */}
      <div className="flex flex-wrap items-start justify-between gap-x-6">
        <TituloPagina titulo="Gestión de Noticias" subtitulo="Administre las noticias, comunicados y publicaciones del portal." />
        {puedeCrear && (
          <Boton type="button" onClick={abrirModalCrear} className="mb-6 inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nueva Noticia
          </Boton>
        )}
      </div>

      {isLoading && (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primario border-t-transparent" />
        </div>
      )}

      {isError && (
        <div role="alert" className="rounded-tema border border-primario/30 bg-primario/10 p-3 text-center text-sm font-semibold text-acento">
          Error al cargar las noticias.
        </div>
      )}

      {!isLoading && !isError && (!noticias || noticias.length === 0) && (
        <div className="rounded-tema border border-borde bg-fondo p-12 text-center text-texto">
          <p className="text-base font-medium text-titulo">No hay noticias registradas</p>
          {puedeCrear && (
            <p className="mt-1 text-xs opacity-75">Haga clic en &quot;Nueva Noticia&quot; para crear la primera.</p>
          )}
        </div>
      )}

      {!isLoading && !isError && noticias && noticias.length > 0 && (
        <div className="overflow-x-auto rounded-tema border border-borde bg-fondo sombra-suave">
          <table className="tabla-adaptable w-full text-left text-sm text-texto">
            <thead className={CABECERA_TABLA}>
              <tr>
                <th scope="col" className="px-4 py-3">Título</th>
                <th scope="col" className="px-4 py-3">Autor</th>
                <th scope="col" className="px-4 py-3">Estado</th>
                <th scope="col" className="px-4 py-3">Fecha</th>
                <th scope="col" className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borde">
              {noticias.map((item) => (
                <tr key={item.id} className="hover:bg-marino-oscuro/5">
                  <td className="px-4 py-3 font-semibold text-titulo">
                    <div className="flex items-center gap-3">
                      {item.imagen && (
                        <img
                          src={item.imagen}
                          alt=""
                          className="h-10 w-12 rounded object-cover"
                        />
                      )}
                      <span className="line-clamp-2 max-w-xs">{item.titulo}</span>
                    </div>
                  </td>
                  <td data-titulo="Autor" className="px-4 py-3 text-xs">{item.autor}</td>
                  <td data-titulo="Estado" className="px-4 py-3">
                    {item.publicada ? (
                      <span className="inline-flex rounded-full bg-chip px-2.5 py-0.5 text-xs font-semibold text-sobre-chip">
                        Publicada
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full border border-borde px-2.5 py-0.5 text-xs font-semibold text-texto-suave">
                        Borrador
                      </span>
                    )}
                  </td>
                  <td data-titulo="Fecha" className="px-4 py-3 text-xs opacity-75">
                    {item.publicada_en || item.creada_en}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        to={`/noticias/${item.id}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Ver en portal"
                        className="rounded p-1 text-texto hover:bg-marino/10 hover:text-acento"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      {puedeEditar && (
                        <Boton
                          type="button"
                          variante="borde"
                          onClick={() => abrirModalEditar(item)}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Edit2 className="h-4 w-4" aria-hidden="true" /> Editar
                        </Boton>
                      )}
                      {puedeEliminar && (
                        <BotonConfirmar
                          pregunta="¿Eliminar esta noticia?"
                          confirmar="Sí, eliminar"
                          ocupado={eliminarMutation.isPending && eliminarMutation.variables === item.id}
                          alConfirmar={() => eliminarMutation.mutate(item.id)}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" /> Eliminar
                        </BotonConfirmar>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Crear / Editar */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-marino-oscuro/70 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-tema border border-borde bg-fondo p-6 sombra-elevada">
            <div className="mb-4 flex items-center justify-between border-b border-borde pb-3">
              <h2 className="text-xl font-bold text-titulo">
                {noticiaEditando ? 'Editar Noticia' : 'Nueva Noticia'}
              </h2>
              <button
                type="button"
                onClick={cerrarModal}
                aria-label="Cerrar"
                className="rounded-tema p-1 text-texto hover:bg-marino/10 hover:text-acento"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <FormularioNoticia
              noticia={noticiaEditando}
              alGuardar={cerrarModal}
              alCancelar={cerrarModal}
            />
          </div>
        </div>
      )}
    </div>
  )
}
