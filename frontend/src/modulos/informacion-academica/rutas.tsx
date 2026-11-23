import type { RouteObject } from 'react-router'
import { RutaProtegida } from '@/compartido/sesion/RutaProtegida'
import { GestionInformacion } from './paginas/GestionInformacion'
import { PaginaInformacion } from './paginas/PaginaInformacion'

export const rutasInformacionAcademica: RouteObject[] = [
  { path: 'informacion-academica', element: <PaginaInformacion /> },
]

export const rutasGestionInformacionAcademica: RouteObject[] = [
  {
    path: 'gestion/informacion-academica',
    element: (
      <RutaProtegida permiso="informacion_academica.ver">
        <GestionInformacion />
      </RutaProtegida>
    ),
  },
]
