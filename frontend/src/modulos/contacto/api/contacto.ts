import { cliente } from '@/compartido/api/cliente'
import type { MensajeContacto } from '../tipos'

export async function getMensajes(): Promise<MensajeContacto[]> {
  const respuesta = await cliente.get<{ data: MensajeContacto[] } | MensajeContacto[]>('/mensajes')
  if (respuesta.data && typeof respuesta.data === 'object' && 'data' in respuesta.data && Array.isArray(respuesta.data.data)) {
    return respuesta.data.data
  }
  return respuesta.data as MensajeContacto[]
}

/** Marca el mensaje como atendido con su nota, o lo devuelve a pendiente (atendido: false). */
export async function atenderMensaje(id: number, respuesta?: string | null, atendido = true): Promise<MensajeContacto> {
  const res = await cliente.put<{ data: MensajeContacto } | MensajeContacto>(`/mensajes/${id}`, {
    respuesta: respuesta ?? '',
    atendido,
  })
  if (res.data && typeof res.data === 'object' && 'data' in res.data) {
    return (res.data as { data: MensajeContacto }).data
  }
  return res.data as MensajeContacto
}

export async function eliminarMensaje(id: number): Promise<void> {
  await cliente.delete(`/mensajes/${id}`)
}
