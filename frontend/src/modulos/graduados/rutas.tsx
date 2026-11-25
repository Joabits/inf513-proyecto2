import type { RouteObject } from 'react-router'
import { RutaProtegida } from '@/compartido/sesion/RutaProtegida'
import { GestionGraduados } from './paginas/GestionGraduados'
import { ListaGraduados } from './paginas/ListaGraduados'
import { MisDatosGraduado } from './paginas/MisDatosGraduado'
import { SolicitarCuenta } from './paginas/SolicitarCuenta'

export const rutasGraduados: RouteObject[] = [
  {
    path: 'graduados',
    element: <ListaGraduados />,
  },
  {
    path: 'alumni',
    element: <ListaGraduados />,
  },
  // CU-10: el graduado solicita su cuenta (la Carrera la aprueba en el panel)
  {
    path: 'alumni/solicitar-cuenta',
    element: <SolicitarCuenta />,
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
