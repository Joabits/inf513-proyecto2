import type { RouteObject } from 'react-router'
import { RutaProtegida } from '@/compartido/sesion/RutaProtegida'
import { GestionConfiguracion } from './paginas/GestionConfiguracion'

export const rutasGestionConfiguracion: RouteObject[] = [
  {
    path: 'gestion/configuracion',
    element: (
      <RutaProtegida permiso="configuracion.ver">
        <GestionConfiguracion />
      </RutaProtegida>
    ),
  },
]
