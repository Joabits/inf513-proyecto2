import type { RouteObject } from 'react-router'
import { RutaProtegida } from '@/compartido/sesion/RutaProtegida'
import { Docentes } from './paginas/Docentes'
import { GestionDocentes } from './paginas/GestionDocentes'

/** CU-24: página pública y su gestión */
export const rutasDocentes: RouteObject[] = [{ path: 'docentes', element: <Docentes /> }]

export const rutasGestionDocentes: RouteObject[] = [
  {
    path: 'gestion/docentes',
    element: (
      <RutaProtegida permiso="docentes.ver">
        <GestionDocentes />
      </RutaProtegida>
    ),
  },
]
