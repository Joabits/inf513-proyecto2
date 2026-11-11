import type { RouteObject } from 'react-router'
import { RutaProtegida } from '@/compartido/sesion/RutaProtegida'
import { GestionInstitucional } from './paginas/GestionInstitucional'
import { LaCarrera } from './paginas/LaCarrera'

export const rutasInstitucional: RouteObject[] = [{ path: 'carrera', element: <LaCarrera /> }]

export const rutasGestionInstitucional: RouteObject[] = [
  {
    path: 'gestion/institucional',
    element: (
      <RutaProtegida permiso="institucional.ver">
        <GestionInstitucional />
      </RutaProtegida>
    ),
  },
]
