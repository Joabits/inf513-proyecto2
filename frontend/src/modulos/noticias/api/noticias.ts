import { cliente } from '@/compartido/api/cliente'
import type { Noticia } from '../tipos'

export async function getNoticias(todas = false): Promise<Noticia[]> {
  const respuesta = await cliente.get<{ data: Noticia[] } | Noticia[]>('/noticias', {
    params: todas ? { todas: 1 } : undefined,
  })
  if (respuesta.data && typeof respuesta.data === 'object' && 'data' in respuesta.data && Array.isArray(respuesta.data.data)) {
    return respuesta.data.data
  }
  return respuesta.data as Noticia[]
}

export async function getNoticia(id: number): Promise<Noticia> {
  const respuesta = await cliente.get<{ data: Noticia } | Noticia>(`/noticias/${id}`)
  if (respuesta.data && typeof respuesta.data === 'object' && 'data' in respuesta.data) {
    return (respuesta.data as { data: Noticia }).data
  }
  return respuesta.data as Noticia
}

export async function crearNoticia(formData: FormData): Promise<Noticia> {
  const respuesta = await cliente.post<{ data: Noticia } | Noticia>('/noticias', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  if (respuesta.data && typeof respuesta.data === 'object' && 'data' in respuesta.data) {
    return (respuesta.data as { data: Noticia }).data
  }
  return respuesta.data as Noticia
}

export async function actualizarNoticia(id: number, formData: FormData): Promise<Noticia> {
  const respuesta = await cliente.post<{ data: Noticia } | Noticia>(`/noticias/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  if (respuesta.data && typeof respuesta.data === 'object' && 'data' in respuesta.data) {
    return (respuesta.data as { data: Noticia }).data
  }
  return respuesta.data as Noticia
}

export async function eliminarNoticia(id: number): Promise<void> {
  await cliente.delete(`/noticias/${id}`)
}
