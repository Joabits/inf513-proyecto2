import { cliente } from '@/compartido/api/cliente'
import type { InformacionAcademica, DatosInformacion } from '../tipos'

export async function getInformacion(): Promise<InformacionAcademica | null> {
  const { data } = await cliente.get<{ data: InformacionAcademica | null }>('/informacion-academica')
  return data?.data ?? null
}

export async function actualizarInformacion(datos: DatosInformacion): Promise<InformacionAcademica> {
  const { data } = await cliente.put<{ data: InformacionAcademica }>('/informacion-academica', datos)
  return data?.data ?? (data as unknown as InformacionAcademica)
}
