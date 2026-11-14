import type { RouteObject } from 'react-router'
import { RutaProtegida } from '@/compartido/sesion/RutaProtegida'
import { GestionInvestigacion } from './paginas/GestionInvestigacion'
import { Investigacion } from './paginas/Investigacion'

/** CU-03: página pública de líneas, proyectos y semilleros. */
export const rutasInvestigacion: RouteObject[] = [{ path: 'investigacion', element: <Investigacion /> }]

/** CU-19 */
export const rutasGestionInvestigacion: RouteObject[] = [
  {
    path: 'gestion/investigacion',
    element: (
      <RutaProtegida permiso="investigacion.ver">
        <GestionInvestigacion />
      </RutaProtegida>
    ),
  },
]
