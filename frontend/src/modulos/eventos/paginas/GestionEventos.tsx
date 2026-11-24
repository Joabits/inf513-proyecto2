import { useState } from 'react'
import { usePermiso } from '@/compartido/sesion/usePermiso'
import { Boton } from '@/compartido/ui/Boton'
import { BotonConfirmar } from '@/compartido/ui/BotonConfirmar'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { CABECERA_TABLA } from '@/compartido/ui/tabla'
import { useActualizarEvento, useCrearEvento, useEliminarEvento, useEventos } from '../hooks/useEventos'
import { FormularioEvento } from '../componentes/FormularioEvento'
import type { Evento } from '../tipos'
import type { EventoFormulario } from '../esquema/eventoSchema'

export function GestionEventos() {
  const { data: eventos, isLoading, isError } = useEventos(false)
  const crearMutation = useCrearEvento()
  const actualizarMutation = useActualizarEvento()
  const eliminarMutation = useEliminarEvento()
  const puedeCrear = usePermiso('eventos.crear')
  const puedeEditar = usePermiso('eventos.editar')
  const puedeEliminar = usePermiso('eventos.eliminar')
  const conAcciones = puedeEditar || puedeEliminar

  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null)
  const [modalAbierto, setModalAbierto] = useState(false)

  const abrirNuevo = () => {
    setEventoSeleccionado(null)
    setModalAbierto(true)
  }

  const abrirEditar = (evento: Evento) => {
    setEventoSeleccionado(evento)
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setEventoSeleccionado(null)
  }

  const handleGuardar = async (datos: EventoFormulario) => {
    const payload = {
      ...datos,
      enlace: datos.enlace ?? null,
    }

    if (eventoSeleccionado) {
      await actualizarMutation.mutateAsync({ id: eventoSeleccionado.id, datos: payload })
    } else {
      await crearMutation.mutateAsync(payload)
    }
    cerrarModal()
  }

  return (
    <div className="space-y-6">
      {/* Mismo encabezado que las demás secciones del panel. mb-0: el título ya trae su margen (anula el space-y) */}
      <div className="mb-0 flex flex-wrap items-start justify-between gap-x-6">
        <TituloPagina titulo="Gestión de Eventos Académicos" subtitulo="Cree, edite y administre los eventos que se muestran en el portal." />
        {puedeCrear && (
          <Boton onClick={abrirNuevo} className="mb-6">
            Nuevo Evento
          </Boton>
        )}
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-marino-oscuro/70 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-tema border border-borde bg-fondo p-6 sombra-elevada">
            <h2 className="mb-4 text-xl font-bold text-titulo">
              {eventoSeleccionado ? 'Editar Evento Académico' : 'Nuevo Evento Académico'}
            </h2>
            <FormularioEvento
              evento={eventoSeleccionado}
              alGuardar={handleGuardar}
              alCancelar={cerrarModal}
              estaCargando={crearMutation.isPending || actualizarMutation.isPending}
            />
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="py-12 text-center text-texto">Cargando eventos...</div>
      ) : isError ? (
        <div role="alert" className="rounded-tema border border-primario/30 bg-primario/10 p-3 text-center text-sm font-semibold text-acento">
          Ocurrió un error al cargar los eventos.
        </div>
      ) : !eventos || eventos.length === 0 ? (
        <div className="rounded-tema border border-borde bg-fondo p-12 text-center text-texto">
          No hay eventos registrados.{puedeCrear && ' Presiona "Nuevo Evento" para crear el primero.'}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-tema border border-borde bg-fondo">
          <table className="w-full text-left text-sm text-texto">
            <thead className={CABECERA_TABLA}>
              <tr>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Lugar</th>
                <th className="px-4 py-3">Fechas</th>
                <th className="px-4 py-3">Estado</th>
                {conAcciones && <th className="px-4 py-3 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-borde">
              {eventos.map((evento) => (
                <tr key={evento.id} className="hover:bg-fondo/80">
                  <td className="px-4 py-3 font-semibold text-titulo">{evento.titulo}</td>
                  <td className="px-4 py-3">{evento.lugar}</td>
                  <td className="px-4 py-3 text-xs">
                    <div>{evento.fecha_inicio}</div>
                    <div className="text-texto/70">{evento.fecha_fin}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        evento.publicado ? 'bg-chip text-sobre-chip' : 'border border-borde text-texto-suave'
                      }`}
                    >
                      {evento.publicado ? 'Publicado' : 'Borrador'}
                    </span>
                  </td>
                  {conAcciones && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {puedeEditar && (
                          <Boton variante="borde" className="text-sm" onClick={() => abrirEditar(evento)}>
                            Editar
                          </Boton>
                        )}
                        {puedeEliminar && (
                          <BotonConfirmar
                            pregunta="¿Eliminar este evento académico?"
                            confirmar="Sí, eliminar"
                            ocupado={eliminarMutation.isPending && eliminarMutation.variables === evento.id}
                            alConfirmar={() => eliminarMutation.mutate(evento.id)}
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
    </div>
  )
}
