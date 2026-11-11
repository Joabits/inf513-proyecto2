import type { RouteObject } from 'react-router'
import { RutaProtegida } from '@/compartido/sesion/RutaProtegida'
import { GestionInvestigacion } from './paginas/GestionInvestigacion'

/** CU-19. La página pública /investigacion es de CU-03 (usa GET /api/investigacion). */
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
