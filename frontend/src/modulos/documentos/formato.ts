const FECHA = new Intl.DateTimeFormat('es-BO', { day: 'numeric', month: 'short', year: 'numeric' })

export const formatoFecha = (iso: string) => FECHA.format(new Date(iso))

export function formatoTamano(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
}

export const NOMBRE_TIPO = { pdf: 'PDF', docx: 'Word', xlsx: 'Excel' } as const
