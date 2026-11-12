import { createBrowserRouter } from 'react-router'
import { RUTA_BASE } from '@/compartido/api/cliente'
import { Plantilla } from '@/compartido/layout/Plantilla'
import { PlantillaAcceso } from '@/compartido/layout/PlantillaAcceso'
import { EnConstruccion } from '@/compartido/paginas/EnConstruccion'
import { PaginaError } from '@/compartido/paginas/PaginaError'
import { rutasAutenticacion } from '@/modulos/autenticacion'
import { rutasInicio } from '@/modulos/inicio'

/*
 * Cada módulo exporta sus rutas desde src/modulos/<modulo>/index.ts
 * y aquí solo se agregan a la lista. Ejemplo:
 *   import { rutasInstitucional } from '@/modulos/institucional'
 *   ...rutasInstitucional,
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
      element: <PlantillaAcceso />,
      errorElement: <PaginaError />,
      children: rutasAutenticacion,
    },
  ],
  { basename: RUTA_BASE || '/' },
)
