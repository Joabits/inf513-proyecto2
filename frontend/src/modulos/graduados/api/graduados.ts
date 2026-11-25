import { cliente, RUTA_BASE } from '@/compartido/api/cliente'
import type { Graduado, GraduadoPublico } from '../tipos'
import type { GraduadoFormValores } from '../esquema/graduadoSchema'
import type { SolicitudCuentaValores } from '../esquema/solicitudCuentaSchema'

export async function getGraduadosPublicos(): Promise<GraduadoPublico[]> {
  const { data } = await cliente.get<{ data: GraduadoPublico[] }>('/graduados')
  return data.data
}

/** Exporta lo mismo que se ve en el panel: con la búsqueda escrita, solo esos graduados. */
export function exportarGraduados(buscar = ''): string {
  const consulta = buscar.trim() ? `?buscar=${encodeURIComponent(buscar.trim())}` : ''
  return `${RUTA_BASE}/api/gestion/graduados/exportar${consulta}`
}

/** CU-10: los datos del propio graduado (rol Usuario); null si todavía no los registró. */
export async function getMiGraduado(): Promise<Graduado | null> {
  const { data } = await cliente.get<{ data: Graduado | null }>('/mi-cuenta/graduado')
  return data.data
}

export async function guardarMiGraduado(datos: GraduadoFormValores): Promise<Graduado> {
  const { data } = await cliente.put<{ data: Graduado }>('/mi-cuenta/graduado', datos)
  return data.data
}

export async function getGraduados(): Promise<Graduado[]> {
  const { data } = await cliente.get<{ data: Graduado[] }>('/gestion/graduados')
  return data.data
}

export async function crearGraduado(datos: GraduadoFormValores): Promise<Graduado> {
  const { data } = await cliente.post<{ data: Graduado }>('/gestion/graduados', datos)
  return data.data
}

export async function actualizarGraduado(id: number, datos: GraduadoFormValores): Promise<Graduado> {
  const { data } = await cliente.put<{ data: Graduado }>(`/gestion/graduados/${id}`, datos)
  return data.data
}

export async function eliminarGraduado(id: number): Promise<void> {
  await cliente.delete(`/gestion/graduados/${id}`)
}

/** CU-10: el graduado solicita su cuenta desde el portal (queda inactiva hasta que la Carrera la apruebe). */
export async function solicitarCuenta(datos: SolicitudCuentaValores): Promise<{ mensaje: string }> {
  const { data } = await cliente.post<{ mensaje: string }>('/graduados/solicitudes', datos)
  return data
}

/** CU-18: la Carrera aprueba la cuenta que solicitó un graduado. */
export async function aprobarCuentaGraduado(id: number): Promise<Graduado> {
  const { data } = await cliente.patch<{ data: Graduado }>(`/gestion/graduados/${id}/cuenta`)
  return data.data
}

/** CU-18: la Carrera rechaza la solicitud: se borran el registro y la cuenta. */
export async function rechazarSolicitudGraduado(id: number): Promise<void> {
  await cliente.delete(`/gestion/graduados/${id}/solicitud`)
}
