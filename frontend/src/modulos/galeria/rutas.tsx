import type { RouteObject } from 'react-router'
import { RutaProtegida } from '@/compartido/sesion/RutaProtegida'
import { GestionGaleria } from './paginas/GestionGaleria'
import { ListaGaleria } from './paginas/ListaGaleria'

export const rutasGaleria: RouteObject[] = [
  { path: 'galeria', element: <ListaGaleria /> },
]

export const rutasGestionGaleria: RouteObject[] = [
  {
    path: 'gestion/galeria',
    element: (
      <RutaProtegida permiso="galeria.ver">
        <GestionGaleria />
      </RutaProtegida>
    ),
  },
]
