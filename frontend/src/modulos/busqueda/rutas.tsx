import type { RouteObject } from 'react-router'
import { Busqueda } from './paginas/Busqueda'

/** CU-07: el buscador de la cabecera lleva a /buscar?q=... */
export const rutasBusqueda: RouteObject[] = [{ path: 'buscar', element: <Busqueda /> }]
