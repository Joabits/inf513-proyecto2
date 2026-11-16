import { cliente } from '@/compartido/api/cliente'
import type { Evento, EventoEntrada } from '../tipos'

export async function getEventos(soloPublicados?: boolean): Promise<Evento[]> {
  const params = soloPublicados !== undefined ? { solo_publicados: soloPublicados ? 1 : 0 } : {}
  const res = await cliente.get<{ data: Evento[] }>('/eventos', { params })
  return res.data.data
}

export async function getEvento(id: number): Promise<Evento> {
  const res = await cliente.get<{ data: Evento }>(`/eventos/${id}`)
  return res.data.data
}

export async function crearEvento(datos: EventoEntrada): Promise<Evento> {
  const res = await cliente.post<{ data: Evento }>('/eventos', datos)
  return res.data.data
}

export async function actualizarEvento(id: number, datos: Partial<EventoEntrada>): Promise<Evento> {
  const res = await cliente.put<{ data: Evento }>(`/eventos/${id}`, datos)
  return res.data.data
}

export async function eliminarEvento(id: number): Promise<void> {
  await cliente.delete(`/eventos/${id}`)
}
