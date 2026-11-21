import { z } from 'zod'

export const graduadoSchema = z.object({
  nombre_completo: z
    .string()
    .trim()
    .min(1, 'El nombre completo es obligatorio.')
    .max(255, 'El nombre completo no debe superar 255 caracteres.'),
  ci: z
    .string()
    .trim()
    .min(1, 'El CI es obligatorio.')
    .max(20, 'El CI no debe superar 20 caracteres.'),
  correo: z
    .string()
    .trim()
    .max(255, 'El correo no debe superar 255 caracteres.')
    .refine((val) => val === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: 'El correo electrónico debe tener un formato válido.',
    })
    .optional(),
  telefono: z
    .string()
    .trim()
    .max(20, 'El teléfono no debe superar 20 caracteres.')
    .optional(),
  gestion_ingreso: z
    .string()
    .trim()
    .min(1, 'La gestión de ingreso es obligatoria.')
    .max(50, 'La gestión no debe superar 50 caracteres.'),
  gestion_egreso: z
    .string()
    .trim()
    .min(1, 'La gestión de egreso es obligatoria.')
    .max(50, 'La gestión no debe superar 50 caracteres.'),
  modalidad: z
    .string()
    .trim()
    .min(1, 'La modalidad de graduación es obligatoria.')
    .max(100, 'La modalidad no debe superar 100 caracteres.'),
  titulo_tema: z
    .string()
    .trim()
    .optional(),
})

export type GraduadoFormValores = z.infer<typeof graduadoSchema>
