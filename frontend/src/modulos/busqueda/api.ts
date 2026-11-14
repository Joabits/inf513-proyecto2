import { cliente } from '@/compartido/api/cliente'
import type { RespuestaBusqueda } from './tipos'

/** Sin tipo trae unos pocos resultados de cada grupo; con tipo, todos los de ese grupo (hasta 30). */
export const buscar = (q: string, tipo: string | null) =>
  cliente.get<RespuestaBusqueda>('/buscar', { params: { q, tipo: tipo ?? undefined } }).then((r) => r.data)
