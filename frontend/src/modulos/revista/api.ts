import { cliente, RUTA_BASE } from '@/compartido/api/cliente'
import type { DatosContenido } from './revista.esquema'
import type { ContenidoCompleto } from './tipos'

const GESTION = '/gestion/revista'

export const obtenerPublica = () => cliente.get<ContenidoCompleto>('/revista').then((r) => r.data)

export const obtenerGestion = () => cliente.get<ContenidoCompleto>(GESTION).then((r) => r.data)

/** Cada cambio devuelve la revista completa del panel. */
export const actualizarContenido = (datos: DatosContenido) => cliente.put<ContenidoCompleto>(`${GESTION}/contenido`, datos).then((r) => r.data)

export const crearEdicion = (datos: FormData) => cliente.post<ContenidoCompleto>(`${GESTION}/ediciones`, datos).then((r) => r.data)

/** Va por POST con _method=PUT porque PHP no lee archivos enviados en un PUT. */
export const actualizarEdicion = (id: number, datos: FormData) => {
  datos.append('_method', 'PUT')
  return cliente.post<ContenidoCompleto>(`${GESTION}/ediciones/${id}`, datos).then((r) => r.data)
}

export const cambiarPublicacion = (id: number, publicada: boolean) =>
  cliente.patch<ContenidoCompleto>(`${GESTION}/ediciones/${id}/publicacion`, { publicada }).then((r) => r.data)

export const eliminarEdicion = (id: number) => cliente.delete<ContenidoCompleto>(`${GESTION}/ediciones/${id}`).then((r) => r.data)

export const crearArticulo = (edicion: number, datos: FormData) =>
  cliente.post<ContenidoCompleto>(`${GESTION}/ediciones/${edicion}/articulos`, datos).then((r) => r.data)

export const actualizarArticulo = (id: number, datos: FormData) => {
  datos.append('_method', 'PUT')
  return cliente.post<ContenidoCompleto>(`${GESTION}/articulos/${id}`, datos).then((r) => r.data)
}

export const eliminarArticulo = (id: number) => cliente.delete<ContenidoCompleto>(`${GESTION}/articulos/${id}`).then((r) => r.data)

export const ordenarArticulos = (edicion: number, ids: number[]) =>
  cliente.put<ContenidoCompleto>(`${GESTION}/ediciones/${edicion}/articulos/orden`, { ids }).then((r) => r.data)

/** Enlaces directos: el navegador abre el PDF con la cookie de sesión (panel) o sin ella (público). */
const api = (ruta: string) => `${RUTA_BASE}/api${ruta}`

export const urlEdicionPublica = (id: number) => api(`/revista/ediciones/${id}/archivo`)
export const urlArticuloPublico = (id: number) => api(`/revista/articulos/${id}/archivo`)
export const urlEdicionPanel = (id: number) => api(`${GESTION}/ediciones/${id}/archivo`)
export const urlArticuloPanel = (id: number) => api(`${GESTION}/articulos/${id}/archivo`)
