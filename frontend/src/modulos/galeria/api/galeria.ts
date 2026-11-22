import { cliente } from '@/compartido/api/cliente'
import type { Galeria } from '../tipos'

export const getGaleria = (params?: { publicadas?: boolean }) =>
  cliente.get<{ data: Galeria[] }>('/galeria', { params }).then((r) => r.data.data)

export const getGaleriaItem = (id: number) =>
  cliente.get<{ data: Galeria }>(`/galeria/${id}`).then((r) => r.data.data)

export const crearGaleria = (datos: FormData) =>
  cliente.post<{ data: Galeria }>('/galeria', datos).then((r) => r.data.data)

export const actualizarGaleria = (id: number, datos: FormData) =>
  cliente.post<{ data: Galeria }>(`/galeria/${id}`, datos).then((r) => r.data.data)

export const eliminarGaleria = (id: number) =>
  cliente.delete(`/galeria/${id}`).then((r) => r.data)
