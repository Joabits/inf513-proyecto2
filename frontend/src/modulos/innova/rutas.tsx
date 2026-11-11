import type { RouteObject } from 'react-router'
import { RutaProtegida } from '@/compartido/sesion/RutaProtegida'
import { EmpresaJunior } from './paginas/EmpresaJunior'
import { GestionInnova } from './paginas/GestionInnova'
import { GestionSolicitudes } from './paginas/GestionSolicitudes'

/** CU-22 y CU-09 */
export const rutasInnova: RouteObject[] = [{ path: 'empresa-junior', element: <EmpresaJunior /> }]

export const rutasGestionInnova: RouteObject[] = [
  {
    path: 'gestion/empresa-junior',
    element: (
      <RutaProtegida permiso="empresa_junior.ver">
        <GestionInnova />
      </RutaProtegida>
    ),
  },
  // CU-23
  {
    path: 'gestion/solicitudes-innova',
    element: (
      <RutaProtegida permiso="solicitudes_innova.ver">
        <GestionSolicitudes />
      </RutaProtegida>
    ),
  },
]
