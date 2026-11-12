import { z } from 'zod'

const texto = (nombre: string, maximo: number) =>
  z.string().trim().min(1, `Escriba ${nombre}.`).max(maximo, `Use como máximo ${maximo} caracteres.`)

export const esquemaContenido = z.object({
  distintivo: z.string().trim().max(80, 'Use como máximo 80 caracteres.'),
  titulo: texto('el título', 120),
  presentacion: texto('el texto de bienvenida', 600),
  director_nombre: texto('el nombre del Director', 120),
  director_cargo: texto('el cargo', 120),
  director_mensaje: texto('el mensaje', 1200),
})

export type DatosContenido = z.infer<typeof esquemaContenido>

export const MAXIMO_FILAS = 8

/** Ruta interna del portal (/malla-curricular) o enlace externo seguro. */
export const ENLACE_VALIDO = /^(\/(?!\/)|https:\/\/)/
const MENSAJE_ENLACE = 'El enlace debe empezar con / o con https://.'

export const esquemaCifras = z.object({
  cifras: z
    .array(z.object({ valor: texto('el valor', 20), etiqueta: texto('la descripción', 60) }))
    .max(MAXIMO_FILAS),
})

export const esquemaAccesos = z.object({
  accesos: z
    .array(
      z.object({
        titulo: texto('el título', 60),
        descripcion: texto('la descripción', 160),
        ruta: texto('el enlace', 200).regex(ENLACE_VALIDO, MENSAJE_ENLACE),
      }),
    )
    .max(MAXIMO_FILAS),
})

export const esquemaBanner = z.object({
  texto_alternativo: texto('qué muestra la imagen', 200),
  enlace: z
    .string()
    .trim()
    .max(200, 'Use como máximo 200 caracteres.')
    .refine((v) => v === '' || ENLACE_VALIDO.test(v), MENSAJE_ENLACE),
})

export type DatosBanner = z.infer<typeof esquemaBanner>
export type DatosCifras = z.infer<typeof esquemaCifras>
export type DatosAccesos = z.infer<typeof esquemaAccesos>
