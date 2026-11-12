import { cliente } from '@/compartido/api/cliente'
import type { Rol, Usuario } from './tipos'
import type { DatosClave, DatosNuevoUsuario, DatosUsuario } from './usuarios.esquema'

const GESTION = '/gestion/usuarios'

export const listarUsuarios = () => cliente.get<{ data: Usuario[] }>(GESTION).then((r) => r.data.data)

export const listarRoles = () => cliente.get<{ data: Rol[] }>(`${GESTION}/roles`).then((r) => r.data.data)

export const crearUsuario = (datos: DatosNuevoUsuario) => cliente.post<{ data: Usuario }>(GESTION, datos).then((r) => r.data.data)

export const actualizarUsuario = (id: number, datos: DatosUsuario) =>
  cliente.put<{ data: Usuario }>(`${GESTION}/${id}`, datos).then((r) => r.data.data)

export const cambiarEstado = (id: number, activo: boolean) =>
  cliente.patch<{ data: Usuario }>(`${GESTION}/${id}/estado`, { activo }).then((r) => r.data.data)

export const cambiarClave = (id: number, datos: DatosClave) => cliente.put(`${GESTION}/${id}/clave`, datos)

export const eliminarUsuario = (id: number) => cliente.delete(`${GESTION}/${id}`)
