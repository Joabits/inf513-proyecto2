import { useState } from 'react'
import { FormularioVinculacion } from '../componentes/FormularioVinculacion'
import {
  useActualizarVinculacion,
  useCrearVinculacion,
  useEliminarVinculacion,
  useVinculaciones,
} from '../hooks/useVinculacion'
import type { Vinculacion } from '../tipos'

export function GestionVinculacion() {
  const { data: vinculaciones, isLoading, isError } = useVinculaciones()
  const crearMutation = useCrearVinculacion()
  const actualizarMutation = useActualizarVinculacion()
  const eliminarMutation = useEliminarVinculacion()

  const [modalAbierto, setModalAbierto] = useState(false)
  const [vinculacionAEditar, setVinculacionAEditar] = useState<Vinculacion | null>(null)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)

  const abrirModalCrear = () => {
    setVinculacionAEditar(null)
    setErrorAccion(null)
    setModalAbierto(true)
  }

  const abrirModalEditar = (v: Vinculacion) => {
    setVinculacionAEditar(v)
    setErrorAccion(null)
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setVinculacionAEditar(null)
    setErrorAccion(null)
  }

  const handleGuardar = async (formData: FormData) => {
    setErrorAccion(null)
    try {
      if (vinculacionAEditar) {
        await actualizarMutation.mutateAsync({ id: vinculacionAEditar.id, datos: formData })
      } else {
        await crearMutation.mutateAsync(formData)
      }
      cerrarModal()
    } catch {
      setErrorAccion('Ocurrió un error al guardar los datos. Verifique la información ingresada.')
    }
  }

  const handleEliminar = async (v: Vinculacion) => {
    if (window.confirm(`¿Está seguro de eliminar "${v.titulo}"? Esta acción no se puede deshacer.`)) {
      try {
        await eliminarMutation.mutateAsync(v.id)
      } catch {
        alert('No se pudo eliminar la vinculación.')
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-borde pb-5">
        <div>
          <h1 className="text-2xl font-bold text-titulo">Gestión de Vinculación</h1>
          <p className="text-sm text-texto mt-1">
            Administre los convenios institucionales, alianzas y proyectos de vinculación con el medio.
          </p>
        </div>
        <button
          type="button"
          onClick={abrirModalCrear}
          className="inline-flex items-center justify-center px-4 py-2 bg-primario text-white text-sm font-medium rounded-tema hover:opacity-90 transition-opacity shadow-sm"
        >
          + Nueva vinculación
        </button>
      </div>

      {isLoading && (
        <div className="text-center py-12 text-sm text-texto">
          Cargando convenios y vinculaciones...
        </div>
      )}

      {isError && (
        <div className="p-4 bg-fondo border border-borde rounded-tema text-red-500 text-sm">
          Error al cargar los registros. Por favor intente nuevamente.
        </div>
      )}

      {!isLoading && !isError && (!vinculaciones || vinculaciones.length === 0) && (
        <div className="text-center py-12 bg-fondo border border-borde rounded-tema">
          <p className="text-sm text-texto">
            No hay vinculaciones registradas. Haga clic en "+ Nueva vinculación" para agregar una.
          </p>
        </div>
      )}

      {!isLoading && !isError && vinculaciones && vinculaciones.length > 0 && (
        <div className="overflow-x-auto bg-fondo border border-borde rounded-tema shadow-sm">
          <table className="min-w-full divide-y divide-borde text-sm">
            <thead className="bg-marino-oscuro text-white">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-semibold">
                  Imagen
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold">
                  Título y Enlace
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold">
                  Estado
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold">
                  Autor
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold">
                  Fecha
                </th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borde text-texto">
              {vinculaciones.map((v) => (
                <tr key={v.id} className="hover:bg-marino/5 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {v.imagen ? (
                      <img
                        src={v.imagen}
                        alt={v.titulo}
                        className="h-12 w-16 object-cover rounded-tema border border-borde"
                      />
                    ) : (
                      <span className="text-xs text-acento italic">Sin imagen</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-titulo">{v.titulo}</div>
                    {v.enlace && (
                      <a
                        href={v.enlace}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primario hover:underline break-all"
                      >
                        {v.enlace}
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {v.publicado ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-tema text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        Publicado
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-tema text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                        Borrador
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-acento">
                    {v.autor || '—'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-acento">
                    {v.creado_en || '—'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => abrirModalEditar(v)}
                      className="px-2.5 py-1 text-xs font-medium bg-marino text-white rounded-tema hover:opacity-90 transition-opacity"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEliminar(v)}
                      className="px-2.5 py-1 text-xs font-medium bg-red-600 text-white rounded-tema hover:bg-red-700 transition-colors"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-fondo border border-borde rounded-tema max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-borde mb-4">
              <h2 className="text-lg font-bold text-titulo">
                {vinculacionAEditar ? 'Editar vinculación' : 'Nueva vinculación'}
              </h2>
              <button
                type="button"
                onClick={cerrarModal}
                className="text-texto hover:text-titulo p-1 rounded-tema"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            {errorAccion && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-tema text-xs text-red-600 dark:text-red-400">
                {errorAccion}
              </div>
            )}

            <FormularioVinculacion
              vinculacion={vinculacionAEditar}
              alGuardar={handleGuardar}
              alCancelar={cerrarModal}
              cargando={crearMutation.isPending || actualizarMutation.isPending}
            />
          </div>
        </div>
      )}
    </div>
  )
}
