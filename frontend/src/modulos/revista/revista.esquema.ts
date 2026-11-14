import { z } from 'zod'

const texto = (nombre: string, maximo: number) =>
  z.string().trim().min(1, `Escriba ${nombre}.`).max(maximo, `Use como máximo ${maximo} caracteres.`)

const opcional = (maximo: number) => z.string().trim().max(maximo, `Use como máximo ${maximo} caracteres.`)

export const esquemaContenido = z.object({
  presentacion: z.string().trim().min(20, 'Escriba al menos 20 caracteres.').max(2000, 'Use como máximo 2000 caracteres.'),
  colaboradores: opcional(4000),
})

export type DatosContenido = z.infer<typeof esquemaContenido>

/** Los números llegan como texto del formulario y se envían tal cual; el servidor los vuelve a revisar. */
export const esquemaEdicion = z.object({
  volumen: z.string().trim().regex(/^([1-9]\d?)?$/, 'Use un número de 1 a 99 o déjelo vacío.'),
  numero: z.string().trim().regex(/^[1-9]\d{0,2}$/, 'Escriba el número de la edición (de 1 a 999).'),
  anio: z
    .string()
    .trim()
    .regex(/^\d{4}$/, 'Escriba el año con cuatro cifras.')
    .refine((anio) => Number(anio) >= 1990 && Number(anio) <= new Date().getFullYear() + 1, 'Escriba un año entre 1990 y el próximo.'),
  titulo: opcional(160),
  descripcion: opcional(1000),
  publicada: z.boolean(),
})

export type DatosEdicion = z.infer<typeof esquemaEdicion>

export const esquemaArticulo = z.object({
  titulo: texto('el título del artículo', 200),
  autores: texto('los autores', 300),
  resumen: opcional(3000),
})

export type DatosArticulo = z.infer<typeof esquemaArticulo>

/** Igual que GuardarEdicionRequest y GuardarArticuloRequest: si cambia allá, cambia aquí. */
export const MAXIMO_PDF_MB = 25
export const MAXIMO_PORTADA_MB = 4
const MINIMO_PORTADA_PX = 300

export function problemaDePdf(archivo: File) {
  if (!archivo.name.toLowerCase().endsWith('.pdf')) return 'El archivo debe ser un PDF.'
  if (archivo.size > MAXIMO_PDF_MB * 1024 * 1024) return `El archivo no debe pesar más de ${MAXIMO_PDF_MB} MB.`
  return null
}

/** Revisa la portada al elegirla, para no esperar a la respuesta del servidor. */
export async function problemaDePortada(archivo: File, url: string) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type)) return 'Use una imagen JPG, PNG o WebP.'
  if (archivo.size > MAXIMO_PORTADA_MB * 1024 * 1024) return `La portada no debe pesar más de ${MAXIMO_PORTADA_MB} MB.`

  const imagen = new Image()
  imagen.src = url
  await imagen.decode()
  if (imagen.naturalWidth < MINIMO_PORTADA_PX || imagen.naturalHeight < MINIMO_PORTADA_PX) {
    return `La portada mide ${imagen.naturalWidth} × ${imagen.naturalHeight} px; debe medir al menos ${MINIMO_PORTADA_PX} × ${MINIMO_PORTADA_PX}.`
  }
  return null
}
