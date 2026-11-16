import { useState } from 'react'
import { Plus, Edit2, Trash2, X, Eye, Newspaper } from 'lucide-react'
import { Link } from 'react-router'
import { useNoticias, useEliminarNoticia } from '../hooks/useNoticias'
import { FormularioNoticia } from '../componentes/FormularioNoticia'
import type { Noticia } from '../tipos'

export function GestionNoticias() {
  const { data: noticias, isLoading, isError } = useNoticias(true)
  const eliminarMutation = useEliminarNoticia()

  const [modalAbierto, setModalAbierto] = useState(false)
  const [noticiaEditando, setNoticiaEditando] = useState<Noticia | undefined>(undefined)
  const [idEliminando, setIdEliminando] = useState<number | null>(null)

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

  const confirmarEliminar = (id: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta noticia? Esta acción no se puede deshacer.')) {
      setIdEliminando(id)
      eliminarMutation.mutate(id, {
        onSettled: () => {
          setIdEliminando(null)
        },
      })
    }
  }

  return (
    <div className="p-6 font-montserrat">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-titulo">
            <Newspaper className="h-6 w-6 text-acento" />
            Gestión de Noticias
          </h1>
          <p className="text-sm text-texto">
            Administre las noticias, comunicados y publicaciones del portal.
          </p>
        </div>

        <button
          onClick={abrirModalCrear}
          className="inline-flex items-center gap-2 rounded-tema bg-primario px-4 py-2 text-sm font-semibold text-sobre-primario shadow hover:bg-marino"
        >
          <Plus className="h-4 w-4" />
          Nueva Noticia
        </button>
      </div>

      {isLoading && (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primario border-t-transparent" />
        </div>
      )}

      {isError && (
        <div className="rounded-tema border border-red-500/30 bg-red-500/10 p-4 text-center text-red-500">
          Error al cargar las noticias.
        </div>
      )}

      {!isLoading && !isError && (!noticias || noticias.length === 0) && (
        <div className="rounded-tema border border-borde bg-fondo p-12 text-center text-texto">
          <p className="text-base font-medium text-titulo">No hay noticias registradas</p>
          <p className="mt-1 text-xs opacity-75">Haga clic en &quot;Nueva Noticia&quot; para crear la primera.</p>
        </div>
      )}

      {!isLoading && !isError && noticias && noticias.length > 0 && (
        <div className="overflow-x-auto rounded-tema border border-borde bg-fondo shadow-sm">
          <table className="w-full text-left text-sm text-texto">
            <thead className="border-b border-borde bg-marino-oscuro/10 text-xs uppercase text-titulo">
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
                  <td className="px-4 py-3 text-xs">{item.autor}</td>
                  <td className="px-4 py-3">
                    {item.publicada ? (
                      <span className="inline-flex rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        Publicada
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                        Borrador
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs opacity-75">
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
                      <button
                        onClick={() => abrirModalEditar(item)}
                        title="Editar"
                        className="rounded p-1 text-texto hover:bg-marino/10 hover:text-acento"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => confirmarEliminar(item.id)}
                        disabled={idEliminando === item.id}
                        title="Eliminar"
                        className="rounded p-1 text-red-500 hover:bg-red-500/10 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-tema border border-borde bg-fondo p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-borde pb-3">
              <h2 className="text-xl font-bold text-titulo">
                {noticiaEditando ? 'Editar Noticia' : 'Nueva Noticia'}
              </h2>
              <button
                onClick={cerrarModal}
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
