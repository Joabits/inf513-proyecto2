import { z } from 'zod'

export const informacionSchema = z.object({
  mision: z.string().trim().min(1, 'La misión es obligatoria.'),
  vision: z.string().trim().min(1, 'La visión es obligatoria.'),
  perfil_profesional: z.string().trim().min(1, 'El perfil profesional es obligatorio.'),
  objetivos: z.string().trim().min(1, 'Los objetivos son obligatorios.'),
})

export type FormularioInformacionDatos = z.infer<typeof informacionSchema>
