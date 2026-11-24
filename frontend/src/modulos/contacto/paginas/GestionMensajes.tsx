import { useState } from 'react'
import { CheckCircle, Clock, X, MessageSquare, Eye, Inbox, RotateCcw } from 'lucide-react'
import { usePermiso } from '@/compartido/sesion/usePermiso'
import { Boton } from '@/compartido/ui/Boton'
import { BotonConfirmar } from '@/compartido/ui/BotonConfirmar'
import { TituloPagina } from '@/compartido/ui/TituloPagina'
import { CABECERA_TABLA } from '@/compartido/ui/tabla'
import { useAtenderMensaje, useEliminarMensaje, useMensajes } from '../hooks/useMensajes'
import type { MensajeContacto } from '../tipos'

/** Estados con los colores del tema: pendiente en rojo de la marca (pide acción), atendido en azul. */
const ESTADO = 'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold'
const PENDIENTE = `${ESTADO} bg-primario text-sobre-primario`
const ATENDIDO = `${ESTADO} bg-chip text-sobre-chip`

export function GestionMensajes() {
  const { data: mensajes, isLoading, isError } = useMensajes()
  const atenderMutation = useAtenderMensaje()
  const eliminarMutation = useEliminarMensaje()
  const puedeAtender = usePermiso('contacto.editar')
  const puedeEliminar = usePermiso('contacto.eliminar')

  const [mensajeSeleccionado, setMensajeSeleccionado] = useState<MensajeContacto | null>(null)
  const [respuesta, setRespuesta] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'pendientes' | 'atendidos'>('todos')
  const [busqueda, setBusqueda] = useState('')

  const abrirModal = (mensaje: MensajeContacto) => {
    setMensajeSeleccionado(mensaje)
    setRespuesta(mensaje.respuesta || '')
  }

  const cerrarModal = () => {
    setMensajeSeleccionado(null)
    setRespuesta('')
  }

  const handleMarcarAtendido = () => {
    if (!mensajeSeleccionado) return

    atenderMutation.mutate(
      { id: mensajeSeleccionado.id, respuesta },
      {
        onSuccess: () => {
          cerrarModal()
        },
      },
    )
  }

  const handleVolverPendiente = () => {
    if (!mensajeSeleccionado) return
    atenderMutation.mutate({ id: mensajeSeleccionado.id, respuesta, atendido: false }, { onSuccess: cerrarModal })
  }

  const handleEliminar = () => {
    if (!mensajeSeleccionado) return
    eliminarMutation.mutate(mensajeSeleccionado.id, { onSuccess: cerrarModal })
  }

  const ocupado = atenderMutation.isPending || eliminarMutation.isPending

  const listaFiltrada = (mensajes || []).filter((m) => {
    if (filtroEstado === 'pendientes' && m.atendido) return false
    if (filtroEstado === 'atendidos' && !m.atendido) return false

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      const nombre = m.nombre?.toLowerCase() || ''
      const correo = m.correo?.toLowerCase() || ''
      const asunto = m.asunto?.toLowerCase() || ''
      const contenido = m.mensaje?.toLowerCase() || ''
      return nombre.includes(q) || correo.includes(q) || asunto.includes(q) || contenido.includes(q)
    }
    return true
  })

  const formatearFecha = (fechaStr?: string) => {
    if (!fechaStr) return '—'
    try {
      const fecha = new Date(fechaStr)
      if (isNaN(fecha.getTime())) return fechaStr
      return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return fechaStr
    }
  }

  return (
    <div className="font-montserrat">
      {/* Mismo encabezado que las demás secciones del panel */}
      <TituloPagina
        titulo="Atención de Mensajes de Contacto"
        subtitulo="Revise y responda las consultas y mensajes enviados por los visitantes del portal."
      />

      {/* Filtros */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFiltroEstado('todos')}
            className={`rounded-tema px-3 py-1.5 text-xs font-semibold transition ${
              filtroEstado === 'todos'
                ? 'bg-primario text-sobre-primario'
                : 'border border-borde bg-fondo text-texto hover:bg-marino-oscuro/10'
            }`}
          >
            Todos ({mensajes?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setFiltroEstado('pendientes')}
            className={`rounded-tema px-3 py-1.5 text-xs font-semibold transition ${
              filtroEstado === 'pendientes'
                ? 'bg-primario text-sobre-primario'
                : 'border border-borde bg-fondo text-texto hover:bg-marino-oscuro/10'
            }`}
          >
            Pendientes ({mensajes?.filter((m) => !m.atendido).length || 0})
          </button>
          <button
            type="button"
            onClick={() => setFiltroEstado('atendidos')}
            className={`rounded-tema px-3 py-1.5 text-xs font-semibold transition ${
              filtroEstado === 'atendidos'
                ? 'bg-primario text-sobre-primario'
                : 'border border-borde bg-fondo text-texto hover:bg-marino-oscuro/10'
            }`}
          >
            Atendidos ({mensajes?.filter((m) => m.atendido).length || 0})
          </button>
        </div>

        <div className="w-full sm:w-64">
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, correo, asunto..."
            className="w-full rounded-tema border border-borde bg-fondo px-3 py-1.5 text-xs text-texto placeholder:text-texto/60 focus:border-acento focus:outline-none"
          />
        </div>
      </div>

      {/* Estados de carga y error */}
      {isLoading && (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primario border-t-transparent" />
        </div>
      )}

      {isError && (
        <div className="rounded-tema border border-primario/30 bg-primario/10 p-4 text-center font-semibold text-acento">
          Ocurrió un error al cargar los mensajes de contacto. Por favor intente nuevamente.
        </div>
      )}

      {/* Estado vacío */}
      {!isLoading && !isError && listaFiltrada.length === 0 && (
        <div className="rounded-tema border border-borde bg-fondo p-12 text-center text-texto">
          <Inbox className="mx-auto mb-3 h-10 w-10 opacity-40 text-acento" />
          <p className="text-base font-medium text-titulo">No hay mensajes para mostrar</p>
          <p className="mt-1 text-xs opacity-75">
            {busqueda.trim()
              ? 'No se encontraron resultados que coincidan con la búsqueda.'
              : 'No se han registrado mensajes de contacto en esta sección.'}
          </p>
        </div>
      )}

      {/* Tabla de mensajes */}
      {!isLoading && !isError && listaFiltrada.length > 0 && (
        <div className="overflow-x-auto rounded-tema border border-borde bg-fondo shadow-sm">
          <table className="tabla-adaptable w-full text-left text-sm text-texto">
            <thead className={CABECERA_TABLA}>
              <tr>
                <th scope="col" className="px-4 py-3">Nombre</th>
                <th scope="col" className="px-4 py-3">Correo</th>
                <th scope="col" className="px-4 py-3">Asunto</th>
                <th scope="col" className="px-4 py-3">Fecha</th>
                <th scope="col" className="px-4 py-3">Estado</th>
                <th scope="col" className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borde">
              {listaFiltrada.map((item) => (
                <tr key={item.id} className="hover:bg-marino-oscuro/5 transition">
                  <td className="px-4 py-3 font-semibold text-titulo">
                    {item.nombre}
                  </td>
                  <td data-titulo="Correo" className="px-4 py-3 text-xs text-texto">
                    {item.correo}
                  </td>
                  <td data-titulo="Asunto" className="px-4 py-3">
                    <span className="line-clamp-1 max-w-xs">{item.asunto}</span>
                  </td>
                  <td data-titulo="Fecha" className="px-4 py-3 text-xs opacity-75">
                    {formatearFecha(item.creado_en || item.created_at)}
                  </td>
                  <td data-titulo="Estado" className="px-4 py-3">
                    {item.atendido ? (
                      <span className={ATENDIDO}>
                        <CheckCircle className="h-3 w-3" aria-hidden="true" />
                        Atendido
                      </span>
                    ) : (
                      <span className={PENDIENTE}>
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        Pendiente
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => abrirModal(item)}
                      className="inline-flex items-center gap-1 rounded-tema border border-borde px-2.5 py-1 text-xs font-semibold text-texto hover:border-acento hover:text-acento transition"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Ver / Atender
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Ver / Atender */}
      {mensajeSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-marino-oscuro/70 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-tema border border-borde bg-fondo p-6 shadow-2xl">
            {/* Cabecera del modal */}
            <div className="mb-4 flex items-center justify-between border-b border-borde pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-acento" />
                <h2 className="text-xl font-bold text-titulo">
                  Detalle del Mensaje
                </h2>
              </div>
              <button
                type="button"
                onClick={cerrarModal}
                className="rounded-tema p-1 text-texto hover:bg-marino/10 hover:text-acento transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Información del remitente */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 rounded-tema border border-borde bg-marino-oscuro/5 p-4 text-sm">
                <div>
                  <span className="font-semibold text-titulo">De:</span>{' '}
                  <span className="text-texto">{mensajeSeleccionado.nombre}</span>
                </div>
                <div>
                  <span className="font-semibold text-titulo">Correo:</span>{' '}
                  <a
                    href={`mailto:${mensajeSeleccionado.correo}`}
                    className="text-acento hover:underline"
                  >
                    {mensajeSeleccionado.correo}
                  </a>
                </div>
                {mensajeSeleccionado.telefono && (
                  <div>
                    <span className="font-semibold text-titulo">Teléfono:</span>{' '}
                    <span className="text-texto">{mensajeSeleccionado.telefono}</span>
                  </div>
                )}
                <div>
                  <span className="font-semibold text-titulo">Fecha:</span>{' '}
                  <span className="text-texto">
                    {formatearFecha(mensajeSeleccionado.creado_en || mensajeSeleccionado.created_at)}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-titulo">Estado actual:</span>{' '}
                  {mensajeSeleccionado.atendido ? <span className={ATENDIDO}>Atendido</span> : <span className={PENDIENTE}>Pendiente</span>}
                </div>
                <div className="sm:col-span-2">
                  <span className="font-semibold text-titulo">Asunto:</span>{' '}
                  <span className="text-texto">{mensajeSeleccionado.asunto}</span>
                </div>
              </div>

              {/* Mensaje original */}
              <div>
                <label className="mb-1 block text-sm font-semibold text-titulo">
                  Mensaje recibido:
                </label>
                <div className="whitespace-pre-wrap rounded-tema border border-borde bg-fondo p-4 text-sm text-texto leading-relaxed">
                  {mensajeSeleccionado.mensaje}
                </div>
              </div>

              {/* Respuesta / Nota interna: solo quien puede atender la escribe */}
              {puedeAtender ? (
                <div>
                  <label htmlFor="modal-respuesta" className="mb-1 block text-sm font-semibold text-titulo">
                    Respuesta o nota interna:
                  </label>
                  <textarea
                    id="modal-respuesta"
                    rows={4}
                    value={respuesta}
                    onChange={(e) => setRespuesta(e.target.value)}
                    placeholder="Escriba la respuesta enviada al usuario o una nota interna sobre la atención..."
                    className="w-full rounded-tema border border-borde bg-fondo p-3 text-sm text-texto placeholder:text-texto/50 focus:border-acento focus:outline-none"
                  />
                </div>
              ) : (
                mensajeSeleccionado.respuesta && (
                  <div>
                    <p className="mb-1 text-sm font-semibold text-titulo">Respuesta o nota interna:</p>
                    <p className="whitespace-pre-wrap rounded-tema border border-borde p-3 text-sm text-texto">{mensajeSeleccionado.respuesta}</p>
                  </div>
                )
              )}

              {(atenderMutation.isError || eliminarMutation.isError) && (
                <p role="alert" className="text-sm font-semibold text-acento">
                  No se pudo guardar el cambio. Revise su conexión e intente de nuevo.
                </p>
              )}

              {/* Acciones del modal */}
              <div className="flex flex-col-reverse flex-wrap items-stretch justify-end gap-2 pt-2 sm:flex-row sm:items-center">
                {puedeEliminar && (
                  <div className="sm:mr-auto">
                    <BotonConfirmar pregunta="¿Eliminar este mensaje?" confirmar="Sí, eliminar" ocupado={eliminarMutation.isPending} alConfirmar={handleEliminar}>
                      Eliminar
                    </BotonConfirmar>
                  </div>
                )}
                <Boton type="button" variante="borde" onClick={cerrarModal} disabled={ocupado}>
                  Cerrar
                </Boton>
                {puedeAtender && mensajeSeleccionado.atendido && (
                  <Boton type="button" variante="borde" onClick={handleVolverPendiente} disabled={ocupado} className="inline-flex items-center justify-center gap-2">
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    Volver a pendiente
                  </Boton>
                )}
                {puedeAtender && (
                  <Boton
                    type="button"
                    variante="primario"
                    onClick={handleMarcarAtendido}
                    disabled={ocupado}
                    className="inline-flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" aria-hidden="true" />
                    {atenderMutation.isPending ? 'Guardando...' : mensajeSeleccionado.atendido ? 'Guardar nota' : 'Marcar como atendido'}
                  </Boton>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
