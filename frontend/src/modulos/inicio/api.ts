import { cliente } from '@/compartido/api/cliente'
import type { DatosAccesos, DatosCifras, DatosContenido } from './inicio.esquema'
import type { ContenidoInicio } from './tipos'

export const obtenerInicio = () => cliente.get<ContenidoInicio>('/inicio').then((r) => r.data)

export const actualizarPortada = (datos: DatosContenido) =>
  cliente.put<ContenidoInicio>('/inicio/portada', datos).then((r) => r.data)

export const guardarCifras = (datos: DatosCifras) => cliente.put<ContenidoInicio>('/inicio/cifras', datos).then((r) => r.data)

export const guardarAccesos = (datos: DatosAccesos) => cliente.put<ContenidoInicio>('/inicio/accesos', datos).then((r) => r.data)
