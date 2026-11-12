import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  actualizarPerfil,
  actualizarUsuario,
  cambiarClave,
  cambiarEstado,
  cambiarMiClave,
  crearUsuario,
  eliminarUsuario,
  listarRoles,
  listarUsuarios,
} from './api'
import type { Usuario } from './tipos'
import type { DatosClave, DatosUsuario } from './usuarios.esquema'

export const CLAVE_USUARIOS = ['usuarios']

export function useUsuarios() {
  return useQuery({ queryKey: CLAVE_USUARIOS, queryFn: listarUsuarios })
}

/** Los roles son fijos: se piden una sola vez. */
export function useRoles() {
  return useQuery({ queryKey: ['usuarios-roles'], queryFn: listarRoles, staleTime: Infinity })
}

/** Reemplaza solo esa cuenta en la lista: el resto no se vuelve a pedir. */
function useReemplazarEnLista() {
  const consultas = useQueryClient()

  return (cambiado: Usuario) => {
    consultas.setQueryData<Usuario[]>(CLAVE_USUARIOS, (lista) => lista?.map((u) => (u.id === cambiado.id ? cambiado : u)))
    // Si editó su propia cuenta, el nombre del panel también cambia
    if (cambiado.es_usted) void consultas.invalidateQueries({ queryKey: ['sesion'] })
  }
}

export function useCrearUsuario() {
  const consultas = useQueryClient()

  return useMutation({
    mutationFn: crearUsuario,
    onSuccess: () => consultas.invalidateQueries({ queryKey: CLAVE_USUARIOS }),
  })
}

export function useActualizarUsuario(id: number) {
  const reemplazar = useReemplazarEnLista()

  return useMutation({ mutationFn: (datos: DatosUsuario) => actualizarUsuario(id, datos), onSuccess: reemplazar })
}

export function useCambiarEstado() {
  const reemplazar = useReemplazarEnLista()

  return useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) => cambiarEstado(id, activo),
    onSuccess: reemplazar,
  })
}

export function useCambiarClave(id: number) {
  return useMutation({ mutationFn: (datos: DatosClave) => cambiarClave(id, datos) })
}

export function useEliminarUsuario() {
  const consultas = useQueryClient()

  return useMutation({
    mutationFn: eliminarUsuario,
    onSuccess: (_respuesta, id) => consultas.setQueryData<Usuario[]>(CLAVE_USUARIOS, (lista) => lista?.filter((u) => u.id !== id)),
  })
}

/** «Mi perfil»: al guardar se vuelve a pedir la sesión (nombre y correo del menú de perfil) y la lista de cuentas. */
export function useActualizarPerfil() {
  const consultas = useQueryClient()

  return useMutation({
    mutationFn: actualizarPerfil,
    onSuccess: () =>
      Promise.all([consultas.invalidateQueries({ queryKey: ['sesion'] }), consultas.invalidateQueries({ queryKey: CLAVE_USUARIOS })]),
  })
}

export function useCambiarMiClave() {
  return useMutation({ mutationFn: cambiarMiClave })
}
