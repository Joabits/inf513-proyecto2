import { z } from 'zod'
import { GRUPOS, type Grupo } from './tipos'

const texto = (nombre: string, maximo: number) =>
  z.string().trim().min(1, `Escriba ${nombre}.`).max(maximo, `Use como máximo ${maximo} caracteres.`)

export const esquemaPersona = z.object({
  nombre: texto('el nombre con su título (Lic., Ing., Dr.)', 160),
  cargo: texto('el cargo', 160),
  grupo: z.enum(Object.keys(GRUPOS) as [Grupo, ...Grupo[]], 'Elija el grupo de la lista.'),
  visible: z.boolean(),
  destacado: z.boolean(),
})

export type DatosPersona = z.infer<typeof esquemaPersona>

/** Igual que GuardarPersonaRequest: si cambia allá, cambia aquí. */
const TIPOS = ['image/jpeg', 'image/png', 'image/webp']
export const MAXIMO_MB = 4
const MINIMO_PX = 300

/** Revisa la foto al elegirla, para no esperar a la respuesta del servidor. */
export async function problemaDeFoto(archivo: File, url: string) {
  if (!TIPOS.includes(archivo.type)) return 'Use una imagen JPG, PNG o WebP.'
  if (archivo.size > MAXIMO_MB * 1024 * 1024) return `La fotografía no debe pesar más de ${MAXIMO_MB} MB.`

  const imagen = new Image()
  imagen.src = url
  await imagen.decode()
  if (imagen.naturalWidth < MINIMO_PX || imagen.naturalHeight < MINIMO_PX) {
    return `La fotografía mide ${imagen.naturalWidth} × ${imagen.naturalHeight} px; debe medir al menos ${MINIMO_PX} × ${MINIMO_PX}.`
  }
  return null
}
