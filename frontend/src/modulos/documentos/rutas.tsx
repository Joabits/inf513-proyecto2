import type { RouteObject } from 'react-router'
import { RutaProtegida } from '@/compartido/sesion/RutaProtegida'
import { GestionDocumentos } from './paginas/GestionDocumentos'
import { ListaDocumentos } from './paginas/ListaDocumentos'

/** Rutas públicas del módulo de documentos. */
export const rutasDocumentos: RouteObject[] = [
  {
    path: 'documentos',
    element: <ListaDocumentos />,
  },
]

/** Rutas de administración y gestión de documentos. */
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
