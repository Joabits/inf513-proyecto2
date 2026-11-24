import type { RouteObject } from 'react-router'
import { RutaProtegida } from '@/compartido/sesion/RutaProtegida'
import { Estadisticas } from './paginas/Estadisticas'

/** Estadísticas del portal y del panel (opción «Estadísticas» del menú) */
export const rutasGestionEstadisticas: RouteObject[] = [
  {
    path: 'gestion/estadisticas',
    element: (
      <RutaProtegida permiso="estadisticas.ver">
        <Estadisticas />
      </RutaProtegida>
    ),
  },
]
