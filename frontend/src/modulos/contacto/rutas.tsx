import type { RouteObject } from 'react-router'
import { RutaProtegida } from '@/compartido/sesion/RutaProtegida'
import { Contacto } from './paginas/Contacto'
import { GestionMensajes } from './paginas/GestionMensajes'

export const rutasContacto: RouteObject[] = [{ path: 'contacto', element: <Contacto /> }]

export const rutasGestionContacto: RouteObject[] = [
  {
    path: 'gestion/mensajes',
    element: (
      <RutaProtegida permiso="contacto.ver">
        <GestionMensajes />
      </RutaProtegida>
    ),
  },
]
