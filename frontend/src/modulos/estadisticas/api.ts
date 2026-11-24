import { cliente } from '@/compartido/api/cliente'
import type { Estadisticas, Periodo } from './tipos'

export const obtenerEstadisticas = (dias: Periodo) =>
  cliente.get<Estadisticas>('/gestion/estadisticas', { params: { dias } }).then((r) => r.data)
