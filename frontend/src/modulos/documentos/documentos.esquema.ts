import { z } from 'zod'

const texto = (nombre: string, maximo: number) =>
  z.string().trim().min(1, `Escriba ${nombre}.`).max(maximo, `Use como máximo ${maximo} caracteres.`)

export const esquemaDocumento = z.object({
  titulo: texto('el título', 160),
  categoria_id: z.string().min(1, 'Elija una categoría.'),
  descripcion: z.string().trim().max(300, 'Use como máximo 300 caracteres.'),
  publicado: z.boolean(),
})

export type DatosDocumento = z.infer<typeof esquemaDocumento>

/** Igual que en GuardarDocumentoRequest: si cambia allá, cambia aquí. */
export const EXTENSIONES = ['.pdf', '.docx', '.xlsx']
export const MAXIMO_MB = 25

/** Revisa el archivo al elegirlo, para no esperar a la respuesta del servidor. */
export function problemaDeArchivo(archivo: File) {
  const nombre = archivo.name.toLowerCase()
  if (!EXTENSIONES.some((extension) => nombre.endsWith(extension))) return 'El archivo debe ser PDF, Word (.docx) o Excel (.xlsx).'
  if (archivo.size > MAXIMO_MB * 1024 * 1024) return `El archivo no debe pesar más de ${MAXIMO_MB} MB.`
  return null
}

export const esquemaCategoria = z.object({
  nombre: z.string().trim().min(3, 'Use al menos 3 caracteres.').max(60, 'Use como máximo 60 caracteres.'),
})
