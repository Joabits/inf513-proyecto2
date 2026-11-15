import { cliente } from '@/compartido/api/cliente'
import type { Vinculacion } from '../tipos'

export async function getVinculaciones(params?: Record<string, unknown>): Promise<Vinculacion[]> {
  const { data } = await cliente.get<{ data: Vinculacion[] }>('/vinculaciones', { params })
  return data.data
}

export async function getVinculacion(id: number): Promise<Vinculacion> {
  const { data } = await cliente.get<{ data: Vinculacion }>(`/vinculaciones/${id}`)
  return data.data
}

export async function crearVinculacion(datos: FormData): Promise<Vinculacion> {
  const { data } = await cliente.post<{ data: Vinculacion }>('/vinculaciones', datos, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}

export async function actualizarVinculacion(id: number, datos: FormData): Promise<Vinculacion> {
  const { data } = await cliente.post<{ data: Vinculacion }>(`/vinculaciones/${id}`, datos, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}

export async function eliminarVinculacion(id: number): Promise<void> {
  await cliente.delete(`/vinculaciones/${id}`)
}
