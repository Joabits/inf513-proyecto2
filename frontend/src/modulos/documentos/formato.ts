const FECHA = new Intl.DateTimeFormat('es-BO', { day: 'numeric', month: 'short', year: 'numeric' })

export const formatoFecha = (iso: string) => FECHA.format(new Date(iso))

export function formatoTamano(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
}

export const NOMBRE_TIPO = { pdf: 'PDF', docx: 'Word', xlsx: 'Excel' } as const

/** «PDF», «Word», «Excel» para mostrar al visitante; un tipo desconocido se muestra en mayúsculas. */
export function nombreFormato(tipo?: string) {
  if (!tipo) return null
  return NOMBRE_TIPO[tipo as keyof typeof NOMBRE_TIPO] ?? tipo.toUpperCase()
}
