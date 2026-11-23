import { z } from 'zod'

export const vinculacionSchema = z.object({
  titulo: z
    .string({ error: 'El título es obligatorio.' })
    .trim()
    .min(1, 'El título es obligatorio.')
    .max(255, 'El título no debe superar los 255 caracteres.'),
  descripcion: z
    .string({ error: 'La descripción es obligatoria.' })
    .trim()
    .min(1, 'La descripción es obligatoria.'),
  enlace: z
    .string()
    .trim()
    .url('Debe ser una URL válida (ej. https://ejemplo.com).')
    .or(z.literal(''))
    .optional(),
  publicado: z.boolean(),
  imagen: z.any().optional(),
})

export type DatosVinculacionForm = z.infer<typeof vinculacionSchema>
