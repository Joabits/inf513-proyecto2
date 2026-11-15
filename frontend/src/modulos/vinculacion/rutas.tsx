import type { RouteObject } from 'react-router'
import { RutaProtegida } from '@/compartido/sesion/RutaProtegida'
import { GestionVinculacion } from './paginas/GestionVinculacion'
import { ListaVinculacion } from './paginas/ListaVinculacion'

export const rutasVinculacion: RouteObject[] = [
  {
    path: 'vinculacion',
    element: <ListaVinculacion />,
  },
]

export const rutasGestionVinculacion: RouteObject[] = [
  {
    path: 'gestion/vinculacion',
    element: (
      <RutaProtegida permiso="vinculacion.ver">
        <GestionVinculacion />
      </RutaProtegida>
    ),
  },
]
