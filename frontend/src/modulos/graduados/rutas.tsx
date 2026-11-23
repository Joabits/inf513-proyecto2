import type { RouteObject } from 'react-router'
import { RutaProtegida } from '@/compartido/sesion/RutaProtegida'
import { GestionGraduados } from './paginas/GestionGraduados'
import { ListaGraduados } from './paginas/ListaGraduados'

export const rutasGraduados: RouteObject[] = [
  {
    path: 'graduados',
    element: <ListaGraduados />,
  },
  {
    path: 'alumni',
    element: <ListaGraduados />,
  },
]

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
