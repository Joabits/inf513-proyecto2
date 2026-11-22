import { z } from 'zod'

export const MAX_IMAGEN_MB = 2
export const FORMATOS_IMAGEN_ACEPTADOS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

export const galeriaSchema = z.object({
  titulo: z
    .string()
    .max(255, 'El título no puede superar los 255 caracteres.')
    .optional()
    .or(z.literal('')),
  descripcion: z
    .string()
    .optional()
    .or(z.literal('')),
  publicado: z.boolean(),
})

export type GaleriaFormulario = z.infer<typeof galeriaSchema>

export function validarArchivoImagen(archivo: File | null | undefined, esObligatorio: boolean = true): string | null {
  if (!archivo) {
    return esObligatorio ? 'La imagen es obligatoria.' : null
  }

  if (!FORMATOS_IMAGEN_ACEPTADOS.includes(archivo.type)) {
    return 'El archivo debe ser una imagen válida (JPG, PNG, WEBP o GIF).'
  }

  if (archivo.size > MAX_IMAGEN_MB * 1024 * 1024) {
    return `La imagen no debe pesar más de ${MAX_IMAGEN_MB} MB.`
  }

  return null
}
