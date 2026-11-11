import { z } from 'zod'

/** Igual que CambiarClaveRequest::reglasClave(): al menos 8 caracteres, una letra y un número. */
export const MINIMO_CLAVE = 8

const clave = z
  .string()
  .min(MINIMO_CLAVE, `La contraseña debe tener al menos ${MINIMO_CLAVE} caracteres.`)
  .max(255, 'Use como máximo 255 caracteres.')
  .regex(/\p{L}/u, 'La contraseña debe contener al menos una letra.')
  .regex(/\p{N}/u, 'La contraseña debe contener al menos un número.')

const confirmar = <T extends { password: string; password_confirmation: string }>(datos: T) =>
  datos.password === datos.password_confirmation

const MENSAJE_CONFIRMAR = { message: 'Las contraseñas no coinciden.', path: ['password_confirmation'] }

const datosCuenta = {
  nombre: z
    .string()
    .trim()
    .min(3, 'Escriba el nombre completo (al menos 3 caracteres).')
    .max(120, 'Use como máximo 120 caracteres.'),
  email: z
    .string()
    .trim()
    .min(1, 'Escriba el correo electrónico.')
    .max(255, 'Use como máximo 255 caracteres.')
    .email('Escriba un correo electrónico válido, por ejemplo nombre@uagrm.edu.bo.'),
  rol_id: z.string().min(1, 'Elija un rol.'),
}

export const esquemaUsuario = z.object(datosCuenta)

export const esquemaNuevoUsuario = z
  .object({
    ...datosCuenta,
    password: clave,
    password_confirmation: z.string().min(1, 'Repita la contraseña.'),
    activo: z.boolean(),
  })
  .refine(confirmar, MENSAJE_CONFIRMAR)

export const esquemaClave = z
  .object({ password: clave, password_confirmation: z.string().min(1, 'Repita la contraseña.') })
  .refine(confirmar, MENSAJE_CONFIRMAR)

export type DatosUsuario = z.infer<typeof esquemaUsuario>
export type DatosNuevoUsuario = z.infer<typeof esquemaNuevoUsuario>
export type DatosClave = z.infer<typeof esquemaClave>
