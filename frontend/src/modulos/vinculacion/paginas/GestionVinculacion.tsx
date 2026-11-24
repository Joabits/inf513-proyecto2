import { useState } from 'react'
import { usePermiso } from '@/compartido/sesion/usePermiso'
import { Boton } from '@/compartido/ui/Boton'
import { BotonConfirmar } from '@/compartido/ui/BotonConfirmar'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { CABECERA_TABLA } from '@/compartido/ui/tabla'
import { FormularioVinculacion } from '../componentes/FormularioVinculacion'
import {
  useActualizarVinculacion,
  useCrearVinculacion,
  useEliminarVinculacion,
  useVinculaciones,
} from '../hooks/useVinculacion'
import type { Vinculacion } from '../tipos'

export function GestionVinculacion() {
  // El panel pide también los borradores; la página pública recibe solo lo publicado
  const { data: vinculaciones, isLoading, isError } = useVinculaciones({ todas: 1 })
  const crearMutation = useCrearVinculacion()
  const actualizarMutation = useActualizarVinculacion()
  const eliminarMutation = useEliminarVinculacion()
  const puedeCrear = usePermiso('vinculacion.crear')
  const puedeEditar = usePermiso('vinculacion.editar')
  const puedeEliminar = usePermiso('vinculacion.eliminar')
  const conAcciones = puedeEditar || puedeEliminar

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

  return (
    <div className="space-y-6">
      {/* Mismo encabezado que las demás secciones del panel. mb-0: el título ya trae su margen (anula el space-y) */}
      <div className="mb-0 flex flex-wrap items-start justify-between gap-x-6">
        <TituloPagina
          titulo="Gestión de Vinculación"
          subtitulo="Administre los convenios institucionales, alianzas y proyectos de vinculación con el medio."
        />
        {puedeCrear && (
          <Boton type="button" onClick={abrirModalCrear} className="mb-6 inline-flex items-center justify-center">
            + Nueva vinculación
          </Boton>
        )}
      </div>

      {isLoading && (
        <div className="text-center py-12 text-sm text-texto">
          Cargando convenios y vinculaciones...
        </div>
      )}

      {isError && (
        <div role="alert" className="rounded-tema border border-primario/30 bg-primario/10 p-3 text-sm font-semibold text-acento">
          Error al cargar los registros. Por favor intente nuevamente.
        </div>
      )}

      {eliminarMutation.isError && (
        <div role="alert" className="rounded-tema border border-primario/30 bg-primario/10 p-3 text-sm font-semibold text-acento">
          No se pudo eliminar la vinculación.
        </div>
      )}

      {!isLoading && !isError && (!vinculaciones || vinculaciones.length === 0) && (
        <div className="text-center py-12 bg-fondo border border-borde rounded-tema">
          <p className="text-sm text-texto">
            No hay vinculaciones registradas.{puedeCrear && ' Haga clic en "+ Nueva vinculación" para agregar una.'}
          </p>
        </div>
      )}

      {!isLoading && !isError && vinculaciones && vinculaciones.length > 0 && (
        <div className="overflow-x-auto bg-fondo border border-borde rounded-tema sombra-suave">
          <table className="tabla-adaptable min-w-full divide-y divide-borde text-sm">
            <thead className={CABECERA_TABLA}>
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
                {conAcciones && (
                  <th scope="col" className="px-4 py-3 text-right font-semibold">
                    Acciones
                  </th>
                )}
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
                      <span className="text-xs text-texto-suave italic">Sin imagen</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-titulo">{v.titulo}</div>
                    {v.enlace && (
                      <a
                        href={v.enlace}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-acento hover:underline break-all"
                      >
                        {v.enlace}
                      </a>
                    )}
                  </td>
                  <td data-titulo="Estado" className="px-4 py-3 whitespace-nowrap">
                    {v.publicado ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-chip text-sobre-chip">
                        Publicado
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border border-borde text-texto-suave">
                        Borrador
                      </span>
                    )}
                  </td>
                  <td data-titulo="Autor" className="px-4 py-3 whitespace-nowrap text-xs text-texto-suave">
                    {v.autor || '—'}
                  </td>
                  <td data-titulo="Fecha" className="px-4 py-3 whitespace-nowrap text-xs text-texto-suave">
                    {v.creado_en || '—'}
                  </td>
                  {conAcciones && (
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        {puedeEditar && (
                          <Boton type="button" variante="borde" onClick={() => abrirModalEditar(v)} className="text-sm">
                            Editar
                          </Boton>
                        )}
                        {puedeEliminar && (
                          <BotonConfirmar
                            pregunta={`¿Eliminar «${v.titulo}»?`}
                            confirmar="Sí, eliminar"
                            ocupado={eliminarMutation.isPending && eliminarMutation.variables === v.id}
                            alConfirmar={() => eliminarMutation.mutate(v.id)}
                          >
                            Eliminar
                          </BotonConfirmar>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-marino-oscuro/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-fondo border border-borde rounded-tema max-w-lg w-full p-6 sombra-elevada max-h-[90vh] overflow-y-auto">
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
              <div role="alert" className="mb-4 rounded-tema border border-primario/30 bg-primario/10 p-3 text-sm font-semibold text-acento">
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
