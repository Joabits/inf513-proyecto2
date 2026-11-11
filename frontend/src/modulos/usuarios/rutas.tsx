import type { RouteObject } from 'react-router'
import { RutaProtegida } from '@/compartido/sesion/RutaProtegida'
import { GestionUsuarios } from './paginas/GestionUsuarios'

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
