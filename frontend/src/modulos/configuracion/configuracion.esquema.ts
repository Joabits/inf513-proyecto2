import { z } from 'zod'
import type { RedSocial } from '@/compartido/configuracion/tipos'

/* Igual que las reglas de ActualizarContactoRequest, GuardarRedesRequest y GuardarEnlacesRequest. */

const texto = (nombre: string, maximo: number) =>
  z.string().trim().min(1, `Escriba ${nombre}.`).max(maximo, `Use como máximo ${maximo} caracteres.`)

const opcional = (maximo: number) => z.string().trim().max(maximo, `Use como máximo ${maximo} caracteres.`)

const vacioO = (valido: (v: string) => boolean) => (v: string) => v === '' || valido(v)

export const soloNumeros = (v: string) => v.replace(/[\s+().-]/g, '')

export const esquemaContacto = z.object({
  direccion: texto('la dirección', 160),
  referencia: opcional(160),
  ciudad: texto('la ciudad', 80),
  telefono: opcional(40).refine(
    vacioO((v) => /^\+?[0-9][0-9 ()-]{5,38}$/.test(v)),
    'Escriba un teléfono válido: números, espacios, guiones, paréntesis y el signo +.',
  ),
  whatsapp: z
    .string()
    .trim()
    .refine(
      vacioO((v) => /^[0-9]{8,15}$/.test(soloNumeros(v))),
      'Escriba el número de WhatsApp con el código de país, por ejemplo 591 70000000.',
    ),
  correo: opcional(120).refine(vacioO((v) => z.email().safeParse(v).success), 'Escriba un correo electrónico válido.'),
  horario: opcional(160),
  mapa_url: opcional(500).refine(
    vacioO((v) => /^https:\/\/\S+$/.test(v)),
    'El enlace del mapa debe ser una dirección web que empiece con https://.',
  ),
})

/** Dominios de cada red, iguales a RedSocial::DOMINIOS: evita pegar el enlace de una red en otra. */
export const DOMINIOS: Record<RedSocial, string[]> = {
  facebook: ['facebook.com', 'fb.com'],
  instagram: ['instagram.com'],
  tiktok: ['tiktok.com'],
  youtube: ['youtube.com', 'youtu.be'],
  linkedin: ['linkedin.com'],
  x: ['x.com', 'twitter.com'],
}

export const REDES = Object.keys(DOMINIOS) as RedSocial[]

export function urlEsDeLaRed(red: RedSocial, url: string) {
  try {
    const host = new URL(url).hostname.toLowerCase()
    return DOMINIOS[red].some((dominio) => host === dominio || host.endsWith(`.${dominio}`))
  } catch {
    return false
  }
}

export const esquemaRedes = z.object({
  redes: z
    .array(
      z.object({
        red: z.enum(REDES, 'Elija una red de la lista.'),
        url: texto('el enlace', 300).regex(/^https:\/\/\S+$/, 'El enlace debe ser una dirección web que empiece con https://.'),
      }),
    )
    .max(REDES.length)
    .superRefine((redes, contexto) => {
      redes.forEach(({ red, url }, i) => {
        if (redes.findIndex((otra) => otra.red === red) !== i) {
          contexto.addIssue({ code: 'custom', path: [i, 'red'], message: 'Esa red ya está en la lista.' })
        }
        if (/^https:\/\//.test(url) && !urlEsDeLaRed(red, url)) {
          contexto.addIssue({ code: 'custom', path: [i, 'url'], message: 'El enlace no es de esa red.' })
        }
      })
    }),
})

export const MAXIMO_ENLACES = 8

/** Página del portal (/documentos) o sitio externo seguro (https://...). */
const ENLACE_VALIDO = /^(\/(?!\/)|https:\/\/)/

export const esquemaEnlaces = z.object({
  enlaces: z
    .array(
      z.object({
        titulo: texto('el título', 60),
        url: texto('el enlace', 300).regex(ENLACE_VALIDO, 'El enlace debe empezar con / o con https://.'),
      }),
    )
    .max(MAXIMO_ENLACES),
})

export type DatosContactoForm = z.infer<typeof esquemaContacto>
export type DatosRedes = z.infer<typeof esquemaRedes>
export type DatosEnlaces = z.infer<typeof esquemaEnlaces>
