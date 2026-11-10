import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import '@/index.css'
import { Proveedores } from './Proveedores'
import { router } from './rutas'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Proveedores>
      <RouterProvider router={router} />
    </Proveedores>
  </StrictMode>,
)
