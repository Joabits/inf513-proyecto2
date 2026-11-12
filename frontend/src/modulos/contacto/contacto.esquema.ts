import { z } from 'zod'

/* Igual que EnviarMensajeRequest: si cambia allá, cambia aquí. */

export const MAXIMO_MENSAJE = 2000

export const esquemaMensaje = z.object({
  nombre: z.string().trim().min(1, 'Escriba su nombre.').min(3, 'Escriba su nombre completo.').max(120, 'Use como máximo 120 caracteres.'),
  correo: z
    .string()
    .trim()
    .min(1, 'Escriba su correo electrónico para poder responderle.')
    .max(120, 'Use como máximo 120 caracteres.')
    .email('Escriba un correo electrónico válido, por ejemplo nombre@gmail.com.'),
  telefono: z
    .string()
    .trim()
    .max(40, 'Use como máximo 40 caracteres.')
    .refine((v) => v === '' || /^\+?[0-9][0-9 ()-]{5,38}$/.test(v), 'Escriba un teléfono válido: números, espacios, guiones, paréntesis y el signo +.'),
  asunto: z.string().trim().min(1, 'Escriba el asunto de su mensaje.').min(3, 'El asunto debe tener al menos 3 caracteres.').max(120, 'Use como máximo 120 caracteres.'),
  mensaje: z
    .string()
    .trim()
    .min(1, 'Escriba su mensaje.')
    .min(10, 'Cuéntenos un poco más: el mensaje debe tener al menos 10 caracteres.')
    .max(MAXIMO_MENSAJE, `Use como máximo ${MAXIMO_MENSAJE} caracteres.`),
  /** Campo trampa para programas automáticos: las personas no lo ven */
  sitio_web: z.string(),
})

export type DatosMensaje = z.infer<typeof esquemaMensaje>
