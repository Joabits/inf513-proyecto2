import { RUTA_BASE } from '@/compartido/api/cliente'

/** La imagen puede venir como URL completa o como ruta del sitio (en el servidor, bajo RUTA_BASE). */
export function urlImagen(imagen: string) {
  return imagen.startsWith('http://') || imagen.startsWith('https://') || !RUTA_BASE ? imagen : `${RUTA_BASE}${imagen}`
}
