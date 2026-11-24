import { createBrowserRouter } from 'react-router'
import { RUTA_BASE } from '@/compartido/api/cliente'
import { Plantilla } from '@/compartido/layout/Plantilla'
import { PlantillaAcceso } from '@/compartido/layout/PlantillaAcceso'
import { PlantillaGestion } from '@/compartido/layout/PlantillaGestion'
import { PaginaError } from '@/compartido/paginas/PaginaError'
import { PanelGestion } from '@/compartido/paginas/PanelGestion'
import { RutaDesconocida } from '@/compartido/paginas/RutaDesconocida'
import { rutasAutenticacion } from '@/modulos/autenticacion'
import { rutasGestionConfiguracion } from '@/modulos/configuracion'
import { rutasContacto, rutasGestionContacto } from '@/modulos/contacto'
import { rutasBusqueda } from '@/modulos/busqueda'
import { rutasDocumentos, rutasGestionDocumentos } from '@/modulos/documentos'
import { rutasGaleria, rutasGestionGaleria } from '@/modulos/galeria'
import { rutasGestionGraduados, rutasGraduados } from '@/modulos/graduados'
import { rutasGestionInicio, rutasInicio } from '@/modulos/inicio'
import { rutasGestionInnova, rutasInnova } from '@/modulos/innova'
import { rutasGestionInvestigacion, rutasInvestigacion } from '@/modulos/investigacion'
import { rutasMallaCurricular } from '@/modulos/malla-curricular'
import { rutasDocentes, rutasGestionDocentes } from '@/modulos/docentes'
import { rutasGestionNoticias, rutasNoticias } from '@/modulos/noticias'
import { rutasGestionInformacionAcademica, rutasInformacionAcademica } from '@/modulos/informacion-academica'
import { rutasGestionInstitucional, rutasInstitucional } from '@/modulos/institucional'
import { rutasEventos, rutasGestionEventos } from '@/modulos/eventos'
import { rutasGestionUsuarios, rutasPerfil } from '@/modulos/usuarios'
import { rutasGestionRevista, rutasRevista } from '@/modulos/revista'
import { rutasGestionBitacora } from '@/modulos/bitacora'
import { rutasGestionEstadisticas } from '@/modulos/estadisticas'
import { rutasGestionVinculacion, rutasVinculacion } from '@/modulos/vinculacion'

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
        ...rutasBusqueda,
        ...rutasContacto,
        ...rutasDocentes,
        ...rutasDocumentos,
        ...rutasInstitucional,
        ...rutasInvestigacion,
        ...rutasNoticias,
        ...rutasInnova,
        ...rutasMallaCurricular,
        ...rutasRevista,
        ...rutasEventos,
        ...rutasGaleria,
        ...rutasInformacionAcademica,
        ...rutasVinculacion,
        ...rutasGraduados,
        // Opción del menú sin módulo todavía («en construcción») o dirección que no existe («no encontrada»)
        { path: '*', element: <RutaDesconocida /> },
      ],
    },
    {
      element: <PlantillaGestion />,
      errorElement: <PaginaError />,
      children: [
        { path: 'gestion', element: <PanelGestion /> },
        ...rutasGestionInicio,
        ...rutasGestionDocentes,
        ...rutasGestionNoticias,
        ...rutasGestionDocumentos,
        ...rutasGestionGraduados,
        ...rutasGestionUsuarios,
        ...rutasGestionContacto,
        ...rutasPerfil,
        ...rutasGestionConfiguracion,
        ...rutasGestionInstitucional,
        ...rutasGestionInformacionAcademica,
        ...rutasGestionInnova,
        ...rutasGestionInvestigacion,
        ...rutasGestionRevista,
        ...rutasGestionBitacora,
        ...rutasGestionEstadisticas,
        ...rutasGestionEventos,
        ...rutasGestionGaleria,
        ...rutasGestionVinculacion,
        // Lo mismo dentro del panel
        { path: 'gestion/*', element: <RutaDesconocida /> },
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
