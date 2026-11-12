import { cliente } from '@/compartido/api/cliente'
import type { DatosContenido, DatosHitos } from './institucional.esquema'
import type { InformacionInstitucional } from './tipos'

export const obtenerInstitucional = () => cliente.get<InformacionInstitucional>('/institucional').then((r) => r.data)

/** Cada guardado devuelve la información completa: la página pública queda al día sin otra petición. */
export const actualizarContenido = (datos: DatosContenido) =>
  cliente.put<InformacionInstitucional>('/institucional/contenido', datos).then((r) => r.data)

export const guardarHitos = (datos: DatosHitos) => cliente.put<InformacionInstitucional>('/institucional/hitos', datos).then((r) => r.data)
