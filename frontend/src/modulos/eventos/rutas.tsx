import type { RouteObject } from 'react-router'
import { RutaProtegida } from '@/compartido/sesion/RutaProtegida'
import { ListaEventos } from './paginas/ListaEventos'
import { GestionEventos } from './paginas/GestionEventos'

export const rutasEventos: RouteObject[] = [
  {
    path: 'eventos',
    element: <ListaEventos />,
  },
]

export const rutasGestionEventos: RouteObject[] = [
  {
    path: 'gestion/eventos',
    element: (
      <RutaProtegida permiso="eventos.ver">
        <GestionEventos />
      </RutaProtegida>
    ),
  },
]
