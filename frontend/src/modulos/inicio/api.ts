import { cliente } from '@/compartido/api/cliente'
import type { DatosContenido } from './inicio.esquema'
import type { ContenidoInicio } from './tipos'

export const obtenerInicio = () => cliente.get<ContenidoInicio>('/inicio').then((r) => r.data)

export const actualizarPortada = (datos: DatosContenido) =>
  cliente.put<ContenidoInicio>('/inicio/portada', datos).then((r) => r.data)
