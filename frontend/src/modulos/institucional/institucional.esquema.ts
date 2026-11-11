import { z } from 'zod'

/* Igual que ActualizarContenidoRequest y GuardarHitosRequest: si cambia allá, cambia aquí. */

export const LIMITES = {
  presentacion: 1000,
  resena_historica: 5000,
  mision: 1000,
  vision: 1000,
  perfil_profesional: 3000,
  campo_ocupacional: 3000,
} as const

/** nombre: «la misión» -> «Escriba la misión.» y «La misión debe tener al menos 20 caracteres.» */
const textoLargo = (nombre: string, maximo: number) =>
  z
    .string()
    .trim()
    .min(1, `Escriba ${nombre}.`)
    .min(20, `${nombre.charAt(0).toUpperCase()}${nombre.slice(1)} debe tener al menos 20 caracteres.`)
    .max(maximo, `Use como máximo ${maximo} caracteres.`)

const hoy = () => new Date().toISOString().slice(0, 10)

export const esquemaContenido = z.object({
  presentacion: textoLargo('la presentación', LIMITES.presentacion),
  resena_historica: textoLargo('la reseña histórica', LIMITES.resena_historica),
  mision: textoLargo('la misión', LIMITES.mision),
  vision: textoLargo('la visión', LIMITES.vision),
  perfil_profesional: textoLargo('el perfil profesional', LIMITES.perfil_profesional),
  campo_ocupacional: textoLargo('el campo ocupacional', LIMITES.campo_ocupacional),
  fecha_creacion: z.string().refine((v) => v === '' || v <= hoy(), 'La fecha de creación no puede ser posterior a hoy.'),
  resolucion: z.string().trim().max(120, 'Use como máximo 120 caracteres.'),
  acreditacion: z.string().trim().max(160, 'Use como máximo 160 caracteres.'),
})

export const PRIMER_ANIO = 1880
export const MAXIMO_HITOS = 12
export const ANIO_ACTUAL = new Date().getFullYear()

export const esquemaHitos = z.object({
  hitos: z
    .array(
      z.object({
        anio: z
          .number({ error: 'Escriba el año.' })
          .int('Escriba un año sin decimales.')
          .min(PRIMER_ANIO, `Escriba un año entre ${PRIMER_ANIO} y ${ANIO_ACTUAL}.`)
          .max(ANIO_ACTUAL, `Escriba un año entre ${PRIMER_ANIO} y ${ANIO_ACTUAL}.`),
        titulo: z.string().trim().min(1, 'Escriba el título.').max(120, 'Use como máximo 120 caracteres.'),
        descripcion: z.string().trim().max(300, 'Use como máximo 300 caracteres.'),
      }),
    )
    .max(MAXIMO_HITOS),
})

export type DatosContenido = z.infer<typeof esquemaContenido>
export type DatosHitos = z.infer<typeof esquemaHitos>
