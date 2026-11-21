import { z } from 'zod'

export const noticiaSchema = z.object({
  titulo: z
    .string()
    .min(1, 'El título es obligatorio.')
    .max(255, 'El título no puede tener más de 255 caracteres.'),
  resumen: z
    .string()
    .min(1, 'El resumen es obligatorio.')
    .max(500, 'El resumen no puede tener más de 500 caracteres.'),
  contenido: z.string().min(1, 'El contenido es obligatorio.'),
  publicada: z.boolean(),
})

export type NoticiaFormData = z.infer<typeof noticiaSchema>
