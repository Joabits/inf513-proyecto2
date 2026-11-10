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
