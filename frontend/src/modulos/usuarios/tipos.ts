import type { SlugRol } from '@/compartido/sesion/tipos'

/** Igual que RolResource.php */
export interface Rol {
  id: number
  slug: SlugRol
  nombre: string
  descripcion: string | null
}

/** Igual que UsuarioResource.php */
export interface Usuario {
  id: number
  nombre: string
  email: string
  rol: Pick<Rol, 'id' | 'slug' | 'nombre'> | null
  activo: boolean
  ultimo_ingreso: string | null
  creado: string
  /** La cuenta de quien está usando el panel: no puede desactivarse, eliminarse ni cambiarse el rol */
  es_usted: boolean
}
