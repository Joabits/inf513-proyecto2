import type { RouteObject } from 'react-router'
import { RutaProtegida } from '@/compartido/sesion/RutaProtegida'
import { GestionUsuarios } from './paginas/GestionUsuarios'
import { MiPerfil } from './paginas/MiPerfil'

export const rutasGestionUsuarios: RouteObject[] = [
  {
    path: 'gestion/usuarios',
    element: (
      <RutaProtegida permiso="usuarios.ver">
        <GestionUsuarios />
      </RutaProtegida>
    ),
  },
]

/** «Mi perfil»: para cualquier cuenta; la plantilla del panel ya exige haber ingresado. */
export const rutasPerfil: RouteObject[] = [{ path: 'gestion/perfil', element: <MiPerfil /> }]
