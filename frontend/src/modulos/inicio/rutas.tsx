import type { RouteObject } from 'react-router'
import { RutaProtegida } from '@/compartido/sesion/RutaProtegida'
import { GestionInicio } from './paginas/GestionInicio'
import { Inicio } from './paginas/Inicio'

export const rutasInicio: RouteObject[] = [
  { index: true, element: <Inicio /> },
  {
    path: 'gestion/inicio',
    element: (
      <RutaProtegida permiso="inicio.editar">
        <GestionInicio />
      </RutaProtegida>
    ),
  },
]
