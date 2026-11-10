export type SlugRol = 'director' | 'editor_institucional' | 'editor_comunicacion' | 'usuario'

export interface UsuarioSesion {
  id: number
  nombre: string
  email: string
  rol: { slug: SlugRol; nombre: string } | null
}
