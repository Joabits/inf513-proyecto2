import type { RouteObject } from 'react-router'
import { RutaProtegida } from '@/compartido/sesion/RutaProtegida'
import { ConsultarBitacora } from './paginas/ConsultarBitacora'

/** CU-29: solo en el panel de gestión */
export const rutasGestionBitacora: RouteObject[] = [
  {
    path: 'gestion/bitacora',
    element: (
      <RutaProtegida permiso="bitacora.ver">
        <ConsultarBitacora />
      </RutaProtegida>
    ),
  },
]
