import { z } from 'zod'
import { ESTADOS, TIPOS, type EstadoProyecto, type TipoProyecto } from './tipos'

/* Igual que los Request de app/Modulos/Investigacion: si cambian allá, cambian aquí. */

const texto = (nombre: string, maximo: number) =>
  z.string().trim().min(1, `Escriba ${nombre}.`).max(maximo, `Use como máximo ${maximo} caracteres.`)

const opcional = (maximo: number) => z.string().trim().max(maximo, `Use como máximo ${maximo} caracteres.`)

export const PRIMERA_GESTION = 1970
export const ANIO_ACTUAL = new Date().getFullYear()
export const ULTIMA_GESTION = ANIO_ACTUAL + 1
export const MAXIMO_RESUMEN = 3000

export const esquemaProyecto = z.object({
  titulo: texto('el título', 200).min(10, 'El título debe tener al menos 10 caracteres.'),
  tipo: z.enum(Object.keys(TIPOS) as [TipoProyecto, ...TipoProyecto[]], 'Elija un tipo de proyecto de la lista.'),
  /** '' = sin línea */
  linea_id: z.string(),
  responsable: texto('el nombre del docente responsable', 160),
  integrantes: opcional(500),
  gestion: z
    .number({ error: 'Escriba el año de la gestión.' })
    .int('Escriba un año sin decimales.')
    .min(PRIMERA_GESTION, `Escriba un año entre ${PRIMERA_GESTION} y ${ULTIMA_GESTION}.`)
    .max(ULTIMA_GESTION, `Escriba un año entre ${PRIMERA_GESTION} y ${ULTIMA_GESTION}.`),
  estado: z.enum(Object.keys(ESTADOS) as [EstadoProyecto, ...EstadoProyecto[]], 'Elija un estado de la lista.'),
  resumen: texto('el resumen', MAXIMO_RESUMEN).min(30, 'El resumen debe tener al menos 30 caracteres.'),
  publicado: z.boolean(),
})

export const MAXIMO_LINEAS = 20

const sinRepetir =
  <T extends { nombre: string }>(mensaje: string) =>
  (filas: T[], contexto: z.RefinementCtx) => {
    filas.forEach(({ nombre }, i) => {
      const clave = nombre.trim().toLowerCase()
      if (clave && filas.findIndex((otra) => otra.nombre.trim().toLowerCase() === clave) !== i) {
        contexto.addIssue({ code: 'custom', path: [i, 'nombre'], message: mensaje })
      }
    })
  }

export const esquemaLineas = z.object({
  lineas: z
    .array(
      z.object({
        /** id de la línea guardada; null si es nueva */
        clave: z.number().nullable(),
        nombre: texto('el nombre', 160),
        descripcion: texto('la descripción', 1000),
      }),
    )
    .max(MAXIMO_LINEAS)
    .superRefine(sinRepetir('Ya hay otra línea con ese nombre.')),
})

export const MAXIMO_SEMILLEROS = 12

export const esquemaComplementos = z.object({
  semilleros_presentacion: opcional(2000),
  semilleros_mision: opcional(1000),
  semilleros_vision: opcional(1000),
  semilleros_objetivos: opcional(2000),
  semilleros_coordinador: opcional(160),
  pia_presentacion: opcional(2000),
  instituto: opcional(1000),
  semilleros: z
    .array(z.object({ nombre: texto('el nombre', 120), descripcion: opcional(300) }))
    .max(MAXIMO_SEMILLEROS)
    .superRefine(sinRepetir('Ya hay otro semillero con ese nombre.')),
})

export type DatosProyecto = z.infer<typeof esquemaProyecto>
export type DatosLineas = z.infer<typeof esquemaLineas>
export type DatosComplementos = z.infer<typeof esquemaComplementos>
