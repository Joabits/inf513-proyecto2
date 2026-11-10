import axios from 'axios'

/** Ruta base del sitio: '' en desarrollo, '/inf513/grupo17sa/proyecto2' en el servidor. */
export const RUTA_BASE = import.meta.env.VITE_RUTA_BASE ?? ''

/**
 * Único cliente HTTP. Todos los módulos lo importan para hablar con Laravel.
 * Envía la cookie de sesión de Sanctum y el token CSRF automáticamente.
 * Antes de iniciar sesión hay que llamar una vez a: cliente.get('/sanctum/csrf-cookie', { baseURL: RUTA_BASE })
 */
export const cliente = axios.create({
  baseURL: `${RUTA_BASE}/api`,
  withCredentials: true,
  withXSRFToken: true,
  headers: { Accept: 'application/json' },
})

/** Respuesta de error de validación de Laravel (422). */
export interface ErroresValidacion {
  message: string
  errors: Record<string, string[]>
}
