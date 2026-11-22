import { useState } from 'react'
import { Boton } from '@/compartido/ui/Boton'
import { useActualizarEvento, useCrearEvento, useEliminarEvento, useEventos } from '../hooks/useEventos'
import { FormularioEvento } from '../componentes/FormularioEvento'
import type { Evento } from '../tipos'
import type { EventoFormulario } from '../esquema/eventoSchema'

export function GestionEventos() {
  const { data: eventos, isLoading, isError } = useEventos(false)
  const crearMutation = useCrearEvento()
  const actualizarMutation = useActualizarEvento()
  const eliminarMutation = useEliminarEvento()

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

  const handleEliminar = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este evento académico?')) {
      await eliminarMutation.mutateAsync(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-titulo">Gestión de Eventos Académicos</h1>
          <p className="text-sm text-texto">Crea, edita y administra los eventos que se muestran en el portal.</p>
        </div>
        <Boton onClick={abrirNuevo}>Nuevo Evento</Boton>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-tema border border-borde bg-fondo p-6 shadow-xl">
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
        <div className="rounded-tema border border-borde bg-fondo p-6 text-center text-red-500">
          Ocurrió un error al cargar los eventos.
        </div>
      ) : !eventos || eventos.length === 0 ? (
        <div className="rounded-tema border border-borde bg-fondo p-12 text-center text-texto">
          No hay eventos registrados. Presiona "Nuevo Evento" para crear el primero.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-tema border border-borde bg-fondo">
          <table className="w-full text-left text-sm text-texto">
            <thead className="border-b border-borde bg-marino-oscuro text-xs uppercase text-sobre-primario">
              <tr>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Lugar</th>
                <th className="px-4 py-3">Fechas</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
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
                        evento.publicado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {evento.publicado ? 'Publicado' : 'Borrador'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Boton variante="borde" className="text-xs px-2 py-1" onClick={() => abrirEditar(evento)}>
                        Editar
                      </Boton>
                      <Boton
                        variante="borde"
                        className="text-xs px-2 py-1 text-red-600 hover:text-red-700"
                        onClick={() => handleEliminar(evento.id)}
                      >
                        Eliminar
                      </Boton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
