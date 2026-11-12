import { z } from 'zod'
import { ESTADOS, type EstadoSolicitud } from './tipos'

/* Igual que las reglas de los Request de app/Modulos/Innova: si cambian allá, cambian aquí. */

const texto = (nombre: string, maximo: number) =>
  z.string().trim().min(1, `Escriba ${nombre}.`).max(maximo, `Use como máximo ${maximo} caracteres.`)

const opcional = (maximo: number) => z.string().trim().max(maximo, `Use como máximo ${maximo} caracteres.`)

const correo = (obligatorio: boolean) =>
  z
    .string()
    .trim()
    .max(120, 'Use como máximo 120 caracteres.')
    .refine((v) => (!obligatorio && v === '') || z.email().safeParse(v).success, 'Escriba un correo electrónico válido, por ejemplo nombre@gmail.com.')

// ---------- CU-22 ----------

export const esquemaPresentacion = z.object({
  presentacion: texto('la presentación', 2000).min(20, 'La presentación debe tener al menos 20 caracteres.'),
  mision: opcional(1000),
  vision: opcional(1000),
  correo: correo(false),
  recibe_solicitudes: z.boolean(),
})

export const MAXIMO_SERVICIOS = 12

export const esquemaServicios = z.object({
  servicios: z
    .array(z.object({ nombre: texto('el nombre', 80), descripcion: texto('la descripción', 300) }))
    .max(MAXIMO_SERVICIOS)
    .superRefine((servicios, contexto) => {
      servicios.forEach(({ nombre }, i) => {
        const clave = nombre.trim().toLowerCase()
        if (clave && servicios.findIndex((otro) => otro.nombre.trim().toLowerCase() === clave) !== i) {
          contexto.addIssue({ code: 'custom', path: [i, 'nombre'], message: 'Ya hay otro servicio con ese nombre.' })
        }
      })
    }),
})

// ---------- CU-09 ----------

export const MAXIMO_DESCRIPCION = 2000

export const OTRO_SERVICIO = 'otro'

export const esquemaSolicitud = z.object({
  nombre: z.string().trim().min(1, 'Escriba su nombre.').min(3, 'Escriba su nombre completo.').max(120, 'Use como máximo 120 caracteres.'),
  organizacion: opcional(160),
  correo: z.string().trim().min(1, 'Escriba su correo electrónico para poder responderle.').pipe(correo(true)),
  telefono: opcional(40).refine(
    (v) => v === '' || /^\+?[0-9][0-9 ()-]{5,38}$/.test(v),
    'Escriba un teléfono válido: números, espacios, guiones, paréntesis y el signo +.',
  ),
  /** id del servicio, u OTRO_SERVICIO para «Otro / no estoy seguro» */
  servicio_id: z.string().min(1, 'Elija el servicio que necesita.'),
  descripcion: z
    .string()
    .trim()
    .min(1, 'Cuéntenos qué necesita.')
    .min(20, 'Describa un poco más lo que necesita (al menos 20 caracteres).')
    .max(MAXIMO_DESCRIPCION, `Use como máximo ${MAXIMO_DESCRIPCION} caracteres.`),
  sitio_web: z.string(),
})

// ---------- CU-23 ----------

export const esquemaAtencion = z
  .object({
    estado: z.enum(Object.keys(ESTADOS) as [EstadoSolicitud, ...EstadoSolicitud[]], 'Elija un estado de la lista.'),
    respuesta: opcional(2000),
  })
  .refine((d) => d.estado !== 'rechazada' || d.respuesta !== '', {
    message: 'Escriba el motivo del rechazo para poder comunicarlo.',
    path: ['respuesta'],
  })

export type DatosPresentacion = z.infer<typeof esquemaPresentacion>
export type DatosServicios = z.infer<typeof esquemaServicios>
export type DatosSolicitud = z.infer<typeof esquemaSolicitud>
export type DatosAtencion = z.infer<typeof esquemaAtencion>
