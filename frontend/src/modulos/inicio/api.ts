import { cliente } from '@/compartido/api/cliente'
import type { ContenidoInicio } from './tipos'

export const obtenerInicio = () => cliente.get<ContenidoInicio>('/inicio').then((r) => r.data)
