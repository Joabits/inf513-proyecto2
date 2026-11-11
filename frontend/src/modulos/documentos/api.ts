import { cliente, RUTA_BASE } from '@/compartido/api/cliente'
import type { Categoria, Documento, VersionDocumento } from './tipos'

const GESTION = '/gestion/documentos'

export const listarDocumentos = () => cliente.get<{ data: Documento[] }>(GESTION).then((r) => r.data.data)

export const listarCategorias = () => cliente.get<{ data: Categoria[] }>(`${GESTION}/categorias`).then((r) => r.data.data)

export const crearCategoria = (nombre: string) =>
  cliente.post<{ data: Categoria }>(`${GESTION}/categorias`, { nombre }).then((r) => r.data.data)

export const crearDocumento = (datos: FormData) => cliente.post<{ data: Documento }>(GESTION, datos).then((r) => r.data.data)

/** Va por POST con _method=PUT porque PHP no lee archivos enviados en un PUT. */
export const actualizarDocumento = (id: number, datos: FormData) => {
  datos.append('_method', 'PUT')
  return cliente.post<{ data: Documento }>(`${GESTION}/${id}`, datos).then((r) => r.data.data)
}

export const cambiarPublicacion = (id: number, publicado: boolean) =>
  cliente.patch<{ data: Documento }>(`${GESTION}/${id}/publicacion`, { publicado }).then((r) => r.data.data)

export const eliminarDocumento = (id: number) => cliente.delete(`${GESTION}/${id}`)

export const listarVersiones = (id: number) =>
  cliente.get<{ data: VersionDocumento[] }>(`${GESTION}/${id}/versiones`).then((r) => r.data.data)

/** Enlaces directos: el navegador abre el PDF o descarga el Excel con la cookie de sesión. */
export const urlDocumento = (id: number) => `${RUTA_BASE}/api${GESTION}/${id}/descargar`

export const urlVersion = (id: number, version: number) => `${RUTA_BASE}/api${GESTION}/${id}/versiones/${version}/descargar`
