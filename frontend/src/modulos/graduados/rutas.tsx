import type { RouteObject } from 'react-router'
import { RutaProtegida } from '@/compartido/sesion/RutaProtegida'
import { GestionGraduados } from './paginas/GestionGraduados'

export const rutasGestionGraduados: RouteObject[] = [
  {
    path: 'gestion/graduados',
    element: (
      <RutaProtegida permiso="graduados.ver">
        <GestionGraduados />
      </RutaProtegida>
    ),
  },
]
