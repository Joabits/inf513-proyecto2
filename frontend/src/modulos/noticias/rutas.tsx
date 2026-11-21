import type { RouteObject } from 'react-router'
import { RutaProtegida } from '@/compartido/sesion/RutaProtegida'
import { ListaNoticias } from './paginas/ListaNoticias'
import { DetalleNoticia } from './paginas/DetalleNoticia'
import { GestionNoticias } from './paginas/GestionNoticias'

export const rutasNoticias: RouteObject[] = [
  { path: 'noticias', element: <ListaNoticias /> },
  { path: 'noticias/:id', element: <DetalleNoticia /> },
]

export const rutasGestionNoticias: RouteObject[] = [
  {
    path: 'gestion/noticias',
    element: (
      <RutaProtegida permiso="noticias.ver">
        <GestionNoticias />
      </RutaProtegida>
    ),
  },
]
