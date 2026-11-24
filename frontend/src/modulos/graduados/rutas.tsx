import type { RouteObject } from 'react-router'
import { RutaProtegida } from '@/compartido/sesion/RutaProtegida'
import { GestionGraduados } from './paginas/GestionGraduados'
import { ListaGraduados } from './paginas/ListaGraduados'
import { MisDatosGraduado } from './paginas/MisDatosGraduado'

export const rutasGraduados: RouteObject[] = [
  {
    path: 'graduados',
    element: <ListaGraduados />,
  },
  {
    path: 'alumni',
    element: <ListaGraduados />,
  },
]

export const rutasGestionGraduados: RouteObject[] = [
  {
    path: 'gestion/graduados',
    element: (
      <RutaProtegida permiso="graduados.ver">
        <GestionGraduados />
      </RutaProtegida>
    ),
  },
  // CU-10: el propio graduado, dentro del panel con su cuenta de rol Usuario
  {
    path: 'mi-cuenta/graduado',
    element: (
      <RutaProtegida permiso="mi_graduado.ver">
        <MisDatosGraduado />
      </RutaProtegida>
    ),
  },
]
