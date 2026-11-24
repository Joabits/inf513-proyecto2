import { cliente } from '@/compartido/api/cliente'
import type { DatosInformacion, InformacionAcademica, PlanEstudios } from '../tipos'

export async function getInformacion(): Promise<InformacionAcademica | null> {
  const { data } = await cliente.get<{ data: InformacionAcademica | null }>('/informacion-academica')
  return data?.data ?? null
}

export async function actualizarInformacion(datos: DatosInformacion): Promise<InformacionAcademica> {
  const { data } = await cliente.put<{ data: InformacionAcademica }>('/informacion-academica', datos)
  return data?.data ?? (data as unknown as InformacionAcademica)
}

/** Datos del plan vigente para la banda de cifras. La malla curricular es la fuente oficial del plan. */
export async function getPlanEstudios(): Promise<PlanEstudios | null> {
  const { data } = await cliente.get<{ data?: { plan?: PlanEstudios }; plan?: PlanEstudios }>('/malla-curricular')
  return data?.data?.plan ?? data?.plan ?? null
}
