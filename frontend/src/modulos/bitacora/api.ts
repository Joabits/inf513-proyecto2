import { cliente } from '@/compartido/api/cliente'
import type { FiltrosBitacora, OpcionesBitacora, PaginaBitacora } from './tipos'

const GESTION = '/gestion/bitacora'

/** Solo los filtros con valor: la URL queda corta y el servidor aplica sus valores por defecto. */
function parametros(filtros: FiltrosBitacora, pagina?: number) {
  const valores: Record<string, string> = Object.fromEntries(Object.entries(filtros).filter(([, valor]) => valor !== ''))
  if (filtros.grupo !== 'accesos') delete valores.resultado
  if (filtros.grupo !== 'auditoria') delete valores.accion
  if (pagina && pagina > 1) valores.page = String(pagina)
  return valores
}

export const consultarBitacora = (filtros: FiltrosBitacora, pagina: number) =>
  cliente.get<PaginaBitacora>(GESTION, { params: parametros(filtros, pagina) }).then((r) => r.data)

export const obtenerOpciones = () => cliente.get<OpcionesBitacora>(`${GESTION}/opciones`).then((r) => r.data)

/** Descarga el CSV con la sesión del usuario y lo guarda con el nombre que propone el servidor. */
export async function exportarBitacora(filtros: FiltrosBitacora) {
  const respuesta = await cliente.get<Blob>(`${GESTION}/exportar`, { params: parametros(filtros), responseType: 'blob' })
  const nombre = /filename="?([^";]+)"?/.exec(respuesta.headers['content-disposition'] ?? '')?.[1] ?? 'bitacora.csv'

  const url = URL.createObjectURL(respuesta.data)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombre
  enlace.click()
  URL.revokeObjectURL(url)
}
