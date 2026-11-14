import { z } from 'zod'

export const eventoSchema = z
  .object({
    titulo: z.string().trim().min(1, 'El título es obligatorio'),
    descripcion: z.string().trim().min(1, 'La descripción es obligatoria'),
    fecha_inicio: z.string().min(1, 'La fecha de inicio es obligatoria'),
    fecha_fin: z.string().min(1, 'La fecha de fin es obligatoria'),
    lugar: z.string().trim().min(1, 'El lugar es obligatorio'),
    enlace: z
      .string()
      .trim()
      .refine((val) => val === '' || z.string().url().safeParse(val).success, {
        message: 'El enlace debe ser una URL válida',
      }),
    publicado: z.boolean(),
  })
  .refine(
    (data) => {
      if (!data.fecha_inicio || !data.fecha_fin) return true
      return new Date(data.fecha_fin).getTime() >= new Date(data.fecha_inicio).getTime()
    },
    {
      message: 'La fecha y hora de fin no puede ser menor a la fecha y hora de inicio',
      path: ['fecha_fin'],
    }
  )

export type EventoFormulario = z.infer<typeof eventoSchema>
