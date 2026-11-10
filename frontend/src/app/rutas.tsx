import { createBrowserRouter } from 'react-router'
import { RUTA_BASE } from '@/compartido/api/cliente'
import { Plantilla } from '@/compartido/layout/Plantilla'
import { EnConstruccion } from '@/compartido/paginas/EnConstruccion'
import { PaginaError } from '@/compartido/paginas/PaginaError'
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
  ],
  { basename: RUTA_BASE || '/' },
)
