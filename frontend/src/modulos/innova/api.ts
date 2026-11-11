import { cliente } from '@/compartido/api/cliente'
import { OTRO_SERVICIO, type DatosAtencion, type DatosPresentacion, type DatosServicios, type DatosSolicitud } from './innova.esquema'
import type { InformacionInnova, SolicitudInnova } from './tipos'

export const obtenerInnova = () => cliente.get<InformacionInnova>('/innova').then((r) => r.data)

export const actualizarPresentacion = (datos: DatosPresentacion) =>
  cliente.put<InformacionInnova>('/innova/contenido', datos).then((r) => r.data)

export const guardarServicios = (datos: DatosServicios) => cliente.put<InformacionInnova>('/innova/servicios', datos).then((r) => r.data)

/** «Otro / no estoy seguro» viaja vacío: la API lo guarda sin servicio. */
export const enviarSolicitud = (datos: DatosSolicitud) =>
  cliente
    .post<{ mensaje: string }>('/innova/solicitudes', { ...datos, servicio_id: datos.servicio_id === OTRO_SERVICIO ? '' : datos.servicio_id })
    .then((r) => r.data)

const GESTION = '/gestion/innova/solicitudes'

export const listarSolicitudes = () => cliente.get<{ data: SolicitudInnova[] }>(GESTION).then((r) => r.data.data)

export const atenderSolicitud = (id: number, datos: DatosAtencion) =>
  cliente.patch<{ data: SolicitudInnova }>(`${GESTION}/${id}`, datos).then((r) => r.data.data)
