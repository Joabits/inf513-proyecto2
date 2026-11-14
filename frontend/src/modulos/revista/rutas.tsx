import type { RouteObject } from 'react-router'
import { RutaProtegida } from '@/compartido/sesion/RutaProtegida'
import { GestionRevista } from './paginas/GestionRevista'
import { Revista } from './paginas/Revista'

/** CU-21: página pública y su gestión */
export const rutasRevista: RouteObject[] = [{ path: 'revista-innovar', element: <Revista /> }]

export const rutasGestionRevista: RouteObject[] = [
  {
    path: 'gestion/revista-innovar',
    element: (
      <RutaProtegida permiso="revista.ver">
        <GestionRevista />
      </RutaProtegida>
    ),
  },
]
