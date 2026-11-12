import { createBrowserRouter } from 'react-router'
import { RUTA_BASE } from '@/compartido/api/cliente'
import { Plantilla } from '@/compartido/layout/Plantilla'
import { PlantillaAcceso } from '@/compartido/layout/PlantillaAcceso'
import { PlantillaGestion } from '@/compartido/layout/PlantillaGestion'
import { EnConstruccion } from '@/compartido/paginas/EnConstruccion'
import { PaginaError } from '@/compartido/paginas/PaginaError'
import { PanelGestion } from '@/compartido/paginas/PanelGestion'
import { rutasAutenticacion } from '@/modulos/autenticacion'
import { rutasGestionConfiguracion } from '@/modulos/configuracion'
import { rutasGestionDocumentos } from '@/modulos/documentos'
import { rutasGestionInicio, rutasInicio } from '@/modulos/inicio'
import { rutasGestionUsuarios } from '@/modulos/usuarios'

/*
 * Cada módulo exporta sus rutas desde src/modulos/<modulo>/index.ts
 * y aquí solo se agregan a la lista. Ejemplo:
 *   import { rutasInstitucional, rutasGestionInstitucional } from '@/modulos/institucional'
 *   ...rutasInstitucional (portal público), ...rutasGestionInstitucional (panel, rutas /gestion/...)
 */
export const router = createBrowserRouter(
  [
    {
      element: <Plantilla />,
      errorElement: <PaginaError />,
      children: [
        ...rutasInicio,
        // Cualquier ruta del menú cuyo módulo aún no existe
        { path: '*', element: <EnConstruccion /> },
      ],
    },
    {
      element: <PlantillaGestion />,
      errorElement: <PaginaError />,
      children: [
        { path: 'gestion', element: <PanelGestion /> },
        ...rutasGestionInicio,
        ...rutasGestionDocumentos,
        ...rutasGestionUsuarios,
        ...rutasGestionConfiguracion,
        // Cualquier opción del panel cuyo módulo aún no existe
        { path: 'gestion/*', element: <EnConstruccion /> },
      ],
    },
    {
      element: <PlantillaAcceso />,
      errorElement: <PaginaError />,
      children: rutasAutenticacion,
    },
  ],
  { basename: RUTA_BASE || '/' },
)
