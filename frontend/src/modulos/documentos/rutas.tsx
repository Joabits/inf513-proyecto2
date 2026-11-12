import type { RouteObject } from 'react-router'
import { RutaProtegida } from '@/compartido/sesion/RutaProtegida'
import { GestionDocumentos } from './paginas/GestionDocumentos'

export const rutasGestionDocumentos: RouteObject[] = [
  {
    path: 'gestion/documentos',
    element: (
      <RutaProtegida permiso="documentos.ver">
        <GestionDocumentos />
      </RutaProtegida>
    ),
  },
]
