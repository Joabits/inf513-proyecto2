import { cliente } from '@/compartido/api/cliente'
import type { Grupo, Persona } from './tipos'

const GESTION = '/gestion/docentes'

/** Lo que ve el visitante: solo las personas visibles, ya ordenadas por grupo. */
export const obtenerPublico = () => cliente.get<{ data: Persona[] }>('/docentes').then((r) => r.data.data)

export const obtenerGestion = () => cliente.get<{ data: Persona[] }>(GESTION).then((r) => r.data.data)

export const crearPersona = (datos: FormData) => cliente.post<{ data: Persona }>(GESTION, datos).then((r) => r.data.data)

/** Va por POST con _method=PUT porque PHP no lee archivos enviados en un PUT. */
export const actualizarPersona = (id: number, datos: FormData) => {
  datos.append('_method', 'PUT')
  return cliente.post<{ data: Persona }>(`${GESTION}/${id}`, datos).then((r) => r.data.data)
}

export const eliminarPersona = (id: number) => cliente.delete(`${GESTION}/${id}`)

export const ordenarPersonas = (grupo: Grupo, ids: number[]) =>
  cliente.put<{ data: Persona[] }>(`${GESTION}/orden`, { grupo, ids }).then((r) => r.data.data)
