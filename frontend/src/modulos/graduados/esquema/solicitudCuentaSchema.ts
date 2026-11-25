import { z } from 'zod'
import { graduadoSchema } from './graduadoSchema'

/** Igual que CambiarClaveRequest::reglasClave() en el servidor: al menos 8 caracteres, una letra y un número. */
const clave = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres.')
  .max(255, 'Use como máximo 255 caracteres.')
  .regex(/\p{L}/u, 'La contraseña debe contener al menos una letra.')
  .regex(/\p{N}/u, 'La contraseña debe contener al menos un número.')

/**
 * CU-10: el graduado solicita su cuenta desde el portal. Sus datos de graduado (los mismos del panel) más el correo,
 * que aquí es obligatorio porque con él ingresa, y la contraseña. Igual que SolicitudCuentaRequest.php.
 */
export const solicitudCuentaSchema = graduadoSchema
  .extend({
    correo: z
      .string()
      .trim()
      .min(1, 'Escriba su correo electrónico: con él ingresará al portal.')
      .max(255, 'Use como máximo 255 caracteres.')
      .email('Escriba un correo electrónico válido, por ejemplo nombre@gmail.com.'),
    password: clave,
    password_confirmation: z.string().min(1, 'Repita la contraseña.'),
    /** Campo trampa: oculto para las personas */
    sitio_web: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, { message: 'Las contraseñas no coinciden.', path: ['password_confirmation'] })

export type SolicitudCuentaValores = z.infer<typeof solicitudCuentaSchema>
